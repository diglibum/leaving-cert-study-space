# Leaving Cert Study Space

A local web app for one learner preparing for the **Leaving Certificate 2027**.
It started as a personal essay trainer and now has two parts:

- **Revision planner:** a daily study plan for Applied Mathematics and Russian
  (Higher), with steps for every block, practice the app can check, pointers to
  real past papers, a calendar and progress tracking.
- **English personal essay practice** (Paper 1): verified real SEC questions, a
  five-step guided flow with fading hints, autosave, version history with
  restore, a facts-versus-reflection paragraph review and criteria checklist,
  and a manual text export for use with an AI tool.

JSON backup and restore cover both parts. Everything in the app and in this
documentation is in English (Russian exercises are the one exception). The
repository and the storage keys still use the earlier name `personal-essay-trainer`
so that existing saved data and backups keep working.

## Getting started

Requires **Node.js 22.22.2+** (a current LTS release is recommended) and npm.
From the project root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Stop the server with `Ctrl+C`.

```sh
npm run build   # TypeScript checks and a production build in dist/
npm run lint    # Oxlint checks supplied by the official template
npm test        # Unit and component tests (Vitest)
npm run preview # Preview the production build locally
```

## Initial architecture

Based on the official Vite `react-ts` template: React, TypeScript, plain CSS,
React Router, and Dexie (IndexedDB).
`package-lock.json` locks dependencies; `node_modules/` and `dist/` are excluded
from Git.

| Path | Purpose |
| --- | --- |
| `src/main.tsx` | React entry point, router, and global styles |
| `src/App.tsx` | Route definitions |
| `src/components/Layout.tsx` | Page shell: skip link, navigation, header, footer, focus handling |
| `src/pages/` | One component per route: Home, Revision (Today and Calendar), Essay practice, Essay history, Essay AI export, Backup, Not found. Route paths are unchanged (`/practice`, `/history`, `/export`) |
| `src/hooks/` | Small shared hooks (document title) |
| `src/features/essays/types.ts` | Essay and essay version types |
| `src/features/questions/` | Verified SEC personal essay question bank (2024–2026, plus 2023 as additional) |
| `src/features/practice/` | Practice flow: step and hint content (`steps.ts`), autosave hook (`useActiveEssay.ts`), workspace components |
| `src/features/feedback/` | Self-check checklist (SEC criteria in plain words) and paragraph tagging |
| `src/features/backup/` | Backup file format, validation, and file download |
| `src/features/export/` | Builds the plain-text export for manual use with AI |
| `src/components/RichTextEditor.tsx` | Dependency-free editor on the browser's `contenteditable`: paragraphs, bold, italic, bulleted and numbered lists |
| `src/features/essays/richText.ts` | Sanitiser and converters for stored essay text (HTML subset or legacy plain text) |
| `src/features/revision/` | Revision planner: pure planning logic (`planner.ts`), review scheduling (`progress.ts`), stored shape and merge (`stored.ts`), subject topic lists (`subjects/`), setup form, study view (today) and calendar view |
| `src/features/history/` | Read-only view of saved essay text |
| `src/storage/database.ts` | Dexie schema (`essays`, `essayVersions`, `archivedEssays`, `revisionPlans`) and migrations |
| `src/storage/essayRepository.ts` | Active essay, versions, restore, archive, and full export/import |
| `src/storage/revisionRepository.ts` | Revision plan settings, done blocks, and topic reviews |
| `src/storage/persistence.ts` | Requests persistent browser storage |
| `src/test/setup.ts` | Test setup (jest-dom matchers, in-memory IndexedDB) |
| `src/index.css`, `src/App.css` | Base styles and responsive layout |
| `vite.config.ts`, `tsconfig*.json`, `.oxlintrc.json` | Build, test, and lint configuration |

### Practice flow

1. **Choose a question** from the verified bank. "Change question" later keeps
   all text already written.
2. **Five steps:** Collect ideas → Choose your focus → Plan your essay →
   Write your essay → Check your essay. The learner can jump between steps. While writing, the plan from step 3
   is shown above the editor (read-only, collapsible).
3. **Help level** (Full / Some / A little / No help) controls how many hints are
   shown. The learner chooses it, and it is saved with the essay, so hints can be
   reduced gradually. Hint wording lives in `src/features/practice/steps.ts`.
4. **Autosave** runs after a short pause in typing, on leaving a field,
   on changing step, and when the page is hidden. A version snapshot is
   recorded on each step change (unchanged text is not recorded twice). A
   visible status shows saved, saving, or failed; failed saves are kept and
   retried. A reminder appears when no backup has been downloaded for a week.
5. **Check your essay** has three tools: a *paragraph review* (mark each paragraph
   as mostly what happened, what I thought or felt, or what I learned, to see
   the balance between facts and reflection without rating every sentence), a *checklist* of ten prompts grouped
   by the four SEC criteria (purpose, coherence, language, mechanics) with a
   rating and evidence note, and free notes. These are the learner's own check,
   not exam marks. The SEC weighting is purpose 30%, coherence 30%, language 30%,
   mechanics 10%.

### Editor and text format

Each step uses a small built-in rich-text editor (no editor library): paragraphs,
**bold**, *italic*, and bulleted and numbered lists, with keyboard shortcuts
(Ctrl/Cmd+B and I). Pasted text is always inserted as plain text. Text is stored
as sanitised HTML limited to `p`, `br`, `strong`, `em`, `ul`, `ol`, and `li`;
everything else is removed on save and on display, and old plain-text essays are
shown as paragraphs. Word counts, paragraph review, and the AI export use
`toPlainText()`, so formatting never affects them. The toolbar uses
`document.execCommand`, which is deprecated but supported by all current
browsers.

### Revision planner

The Revision page turns "do revision every day" into a concrete plan. The learner
picks subjects with a level (Higher or Ordinary) and a confidence (weak, okay, or
strong), the start date and first exam date (default 1 June), and the minutes
available on each weekday. It also takes an optional modelling project due date.
Everything is computed on the device by `buildRevisionPlan()`; there is no AI.

- **Phases**, anchored to the exam date: *Build* (learn each topic and recall it
  without notes), *Practise* (past paper questions by topic, up to 10 weeks),
  *Exam mode* (the last 6 weeks: timed questions, choosing questions, and
  reviewing mistakes), and *Light review* (the last 2 days). Short plans shorten
  Build and Practise first and keep Exam mode.
- **Time sharing:** each week's study blocks (25 to 60 minutes, at most 4 a day)
  are shared between subjects by confidence weight (weak 1.5, okay 1, strong
  0.7). With enough blocks every subject is seen at least twice a week, and the
  same subject is avoided twice in a row.
- **Topics:** Build blocks walk through the subject's topics in the listed order,
  with time shared by a rough size. The Applied Mathematics list (strands 2 to 4)
  comes from the NCCA specification (2019); strand 1 is covered by the modelling
  project and the exam contexts. Higher-only topics are flagged and skipped for
  Ordinary level. The 2027 SEC assessment arrangements (see `exam-papers/`) give
  eight questions out of ten on strands 2, 3, and 4.
- **Review queue:** after a block or a recall the learner marks a topic "Got it"
  or "Shaky". Got it moves the next review out (1, 3, 7, 21, then 45 days); Shaky
  brings it back the next day. Due topics are shown first on the Today view.
- **Missed days:** "Re-plan from today" rebuilds the plan from today. Topic
  progress is kept; done marks belong to one plan and are cleared when the plan
  changes.
- **Home page:** a card at the top shows today's blocks (or the next study day on a
  rest day), how many are done, and how many topics are due for recall, with
  links to the steps (`/revision`) and to the full calendar (`/revision/calendar`).
  Without a plan the card invites the learner to set one up.
- **Two pages:** *Today* (`/revision`) is for studying and shows only the day's
  work: the recall check, a progress bar, and the blocks. Only the next unfinished
  block is open; the others are collapsed to a title and a Start button, and
  finishing a block opens the next one. *Calendar* (`/revision/calendar`) holds
  everything for planning: progress per subject, phases, the weekly list, Change
  setup, and Re-plan from today.
- **Studying ahead:** the Today page can open any later study day
  (`/revision/day/<date>`), from the "Next study day" link or "Open steps" in the
  calendar, and shows its steps. Blocks finished there are saved for that day.
  When today is a rest day or the plan has not begun, the next study day is shown
  by default.
- **Concrete tasks:** each block on the Today view is split into timed steps by
  `tasks.ts`. Learn blocks give reading, closed-book recall prompts, and one past
  paper part; Practise blocks give a warm-up and past paper parts for the topic
  (a different set each time); Exam mode names whole questions, putting the ones
  with shaky topics first; Review and Light review give a fixed routine.
- **Practice problems:** every Applied Mathematics topic has a generator in
  `problems/appliedMathsProblems.ts` that writes an original problem (random
  numbers from a seed, so a problem stays the same during the day) and computes the
  answers in code. Learn and Practise blocks show them in a panel: type the
  answers, press "Check answers" (a comma works as a decimal point, 1% tolerance),
  open the worked solution, or ask for a "New problem". The panel and a plain
  "Check my own working with an AI" box on every block build a prompt (question,
  your working, your answers, the app's reference answers, and rules: quote exact
  lines, strengths first, at most three improvements, hints not full solutions, no
  mark) that you copy by hand into an AI tool. The app itself never calls an AI.
- **Pictures and sketches:** problems that depend on a picture (networks for
  spanning trees, Dijkstra and dynamic programming; velocity-time graphs) are drawn
  by the app as SVG (`DiagramView.tsx`, builders in `problems/diagrams.ts`). Each
  picture has a text alternative, and the worked solution highlights the chosen
  edges or route. "Sketch task" panels (`appliedMathsSketches.ts`) ask the learner to
  draw a graph on paper (velocity-time, projectile path, exponential growth); the
  learner then shows a reference graph drawn by the app and ticks a checklist of
  features. Written working and sketches are checked by copying a prompt into an AI
  tool and attaching a photo by hand; the app has no drawing canvas and never uploads
  anything.
- **Past papers:** Applied Mathematics questions from 2023 to 2026 are mapped to
  topics in `subjects/appliedMathsPapers.ts` (2022 followed the old syllabus). An
  entry holds only the year, question and part number, topics, and a short
  description written for this app. It never contains paper text, which stays in
  the learner's own copy from `exam-papers/` or examinations.ie.

- **Russian (Higher Level only):** `subjects/russian.ts` lists the topics that follow
  the Higher Level structure in the SEC Assessment Arrangements 2027, the syllabus
  and the 2019 to 2026 Higher papers (all in `exam-papers/sec/`): the oral
  (conversation about yourself, discursive conversation on the cultural topics,
  and the project), the aural, and the written paper (reading comprehension,
  structuring discourse, written expression with grammar, the short essay on
  Russian culture, guided writing, and the language awareness tasks), with the
  grammar, vocabulary and cultural knowledge they need. Timed, learn and practise
  blocks name a real past paper by year in our own words
  (`subjects/russianPapers.ts`) with the paths of its paper, marking scheme and,
  for the aural, the recording; they rotate through the years. The marking-scheme
  rules are in the steps: comprehension answers in English at 2 marks per detail,
  a grammar answer is right or wrong, the 50-word essay needs a title and five
  facts, and the 140-word guided writing needs every point and has a soft sign
  rule. Oral topics come early because the oral exam is held before the written
  papers; the oral part is 40 marks of narrative conversation, 30 of discursive
  conversation and 30 for the project. Guided writing is Higher only. Each topic
  has an `area` and `subjects/russianTasks.ts` writes the steps for every block
  kind from it. Blocks use a writing check with profiles that follow the real
  marking scheme (short essay, guided writing, comprehension, speaking) and a
  word counter (`buildWritingCheckPrompt`): quotes, strengths first, up to three
  improvements, rules and hints rather than a rewrite, and no mark.
  Topics have typed practice sets (`subjects/russianSources.ts`, checked in
  `problems/checkText.ts`) of several kinds, each rotating on "New set": gap-fill
  items; whole grammar texts with words in brackets (`russianCloze.ts`); matching
  news items to newspaper sections (`russianMatching.ts`); naming words from a
  semantic field (`russianLists.ts`); culture fact quizzes on places, nature,
  people, society and traditions (`russianCulture.ts`); and speaking prompts for
  the oral parts with tips and a self-check (`russianOral.ts`). The data is
  original, with English notes; answers are compared ignoring case, stress marks
  and the difference between the letters yo and ye. Those data files are the only
  place with Cyrillic (a documented exception in `AGENTS.md`, enforced by
  `src/cyrillic.test.ts`); everything else stays English. The aural recordings
  (about 75 MB each) stay in `exam-papers/sec/audio/`, which is git-ignored.

Adding a subject means adding a `RevisionSubject` with topics from the official
specification in `src/features/revision/subjects/` and registering it in
`revisionSubjects`. Add recall prompts, practice problem generators (original, with computed answers) and, after checking the official papers, past paper parts too.
A subject whose work is not problem solving can set `area` on its topics and
supply its own `tasks`, `help` and `checkKind`, as Russian does.
Planning rules are covered by `planner.test.ts` and task rules by `tasks.test.ts`.

### History

The History page shows saved versions (newest first), lets the learner save a
version manually, and restores an older one after confirmation (the current text
is first kept as a "before a restore" version, so a restore can be undone).
"Start a new essay" moves the current essay and its versions to the archive;
nothing is deleted. Archived essays can be read there and are included in
backups.

### Backup and restore

The Backup page downloads one JSON file (`formatVersion` 2) with the current
essay, its versions, archived essays, and the revision plan and progress.
Version 1 files (made before the revision planner) are still accepted and are
read as having no revision data. Restoring validates the file strictly,
shows a preview, and changes nothing until confirmed. Different current work is
archived first; archived essays from the file are merged without duplicates.
Revision data is merged and never replaced: the newer plan settings win and each
topic keeps its most recent review. A backup without revision data leaves the
current plan untouched.
Backups from a newer format version are rejected. When the format changes, bump
`BACKUP_FORMAT_VERSION` and add a migration in `backupFormat.ts`.

### AI export

The AI export page builds plain text (request, question, notes, plan, essay,
and the learner's own review) that the learner copies or downloads and pastes
into any tool by choice. The app makes no network request. The prompt asks for
quoted evidence and improvement suggestions, and asks the AI not to give marks.

### AI pack

`ai-pack/` is an optional, separate way to practise with an AI tool. It holds a
`leaving-cert-tutor` skill (`SKILL.md`) and JSON files with exercises and answer
keys in `ai-pack/leaving-cert-tutor/data/`. The AI tutor sets the exercises,
checks answers against the key and gives feedback with the same rules as the
app's AI check (quotes, strengths first, up to three improvements, no marks).
It works with Claude skills, GitHub Copilot skills, a custom GPT, or by pasting
into any chat; see `ai-pack/README.md`. Only Russian is covered so far.

The data files are generated from the app's own exercise data by
`npm run build:ai-pack` (`scripts/build-ai-pack.mjs`, `src/features/aipack/`),
so the answers cannot drift. A test fails when they are out of date. The pack
contains no exam paper text. The app itself still makes no network calls.

### Local data

There is no backend, authentication, API key, AI integration, telemetry, or
external font, and the app does not send data over the network. It runs locally
only; there is no deployment yet.

The app keeps one active essay (deliberate) plus version snapshots and archived
essays, and one revision plan row, stored in IndexedDB through Dexie. Schema changes must
add a new `this.version(n)` with an upgrade step in `database.ts` rather than
editing a released version. Call `requestPersistentStorage()` when the learner
first saves, not on page load, because some browsers show a permission prompt.

## Exam papers

The author keeps the official SEC papers and marking schemes in `exam-papers/`
for personal study. They contain third-party copyrighted texts, so the folder is
git-ignored and is not in this public repository; only `exam-papers/README.md`
is, and it lists where to download each file. See that file.

## Status and possible next steps

All planned stages are implemented: foundation, storage, verified question bank,
guided practice, autosave and versioning, backup and manual AI export, and
self-check. Possible future work, only if needed:

- Per-question idea starters, written and checked by a person (none are included
  now to avoid invented content).
- Version pruning if history becomes very long after months of use.
- Reading the 2023–2026 marking schemes in `exam-papers/` to refine the
  checklist wording. Treat them as guidance, never as exam marks.
- New questions only after checking them against official SEC papers.
