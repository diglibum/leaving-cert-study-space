# Project guide for coding agents

Leaving Cert Study Space (formerly Personal Essay Trainer): a local-only React +
TypeScript + Vite app for one learner preparing for the Leaving Certificate: a
revision planner (Applied Mathematics, Russian Higher) and practice for the
English Higher Level Paper 1 personal essay. The package, IndexedDB database,
backup `app` value and localStorage keys keep the old `personal-essay-trainer`
name on purpose. See `README.md` for features and architecture, and
`docs/decisions.md` for why things are the way they are.

## Commands

- `npm run dev`: dev server (do not leave it running)
- `npm test`: Vitest (jsdom, in-memory IndexedDB)
- `npx tsc -b` or `npm run build`: type check and production build
- `npm run lint`: Oxlint

Run tests, type check, and lint before committing.

## Rules

- **English only** in the UI, metadata, docs, and code comments. One exception:
  the Russian exercises, which the learner types in Russian, may contain
  Cyrillic, and only in the Russian data files listed in `src/cyrillic.test.ts`
  (`russianExercises.ts`, `russianCloze.ts`, `russianCulture.ts`,
  `russianLists.ts`, `russianMatching.ts`, `russianOral.ts` and the tests that
  read them). Instructions, notes, and the UI around them
  stay English. `src/cyrillic.test.ts` enforces the list of allowed files.
- **No network**: no backend, auth, API keys, telemetry, external fonts, or AI
  calls. The AI export is plain text the learner copies by hand.
- **AI pack:** `ai-pack/leaving-cert-tutor/data/*.json` is generated; never edit it by
  hand. After changing exercise data run `npm run build:ai-pack`. Keep exam paper
  text out of the pack, and keep `SKILL.md` in English.
- **Exam material is copyrighted.** The repository is public: `exam-papers/` is
  git-ignored (only its README is tracked), so never commit PDFs, marking
  schemes, recordings or teacher sheets, and never move them into `public/` or
  `src/`. Add questions only after
  checking the official SEC paper; never invent exam content.
- Feedback is the learner's own evidence-based check, never an exam mark.
- Keep dependencies minimal and prefer plain CSS and small components.

## Data and compatibility

- Storage is IndexedDB via Dexie (`src/storage/`). Never edit a released
  schema version: add `this.version(n + 1)` with an upgrade step.
- Essay text fields hold sanitised HTML (`p`, `br`, `strong`, `em`, `ul`, `ol`,
  `li`) or legacy plain text. Read text through `toPlainText()` in
  `src/features/essays/richText.ts` for counts, paragraph review, and exports.
- Backup files carry `formatVersion`. Changing the format means bumping
  `BACKUP_FORMAT_VERSION` and adding a migration in `backupFormat.ts`.
- Restores and "new essay" archive existing work; they never delete it.
  Revision data is merged on restore, never replaced.

## Conventions

- Pages in `src/pages/`, feature code in `src/features/<name>/`, shared UI in
  `src/components/`, storage in `src/storage/`.
- Tests sit next to the code. Page tests use the real Dexie database on
  fake-indexeddb; clear tables in `beforeEach`.
- Accessibility matters: labelled controls, visible focus, focus moved on step
  and route changes, status messages with `role="status"` or `role="alert"`.
- Use the `grep` tool with `[А-Яа-яЁё]` to check that no Cyrillic text slipped in;
  the only matches should be the Russian data files named above.
