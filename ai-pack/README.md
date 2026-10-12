# AI pack

A set of files that lets you practise with any AI chat tool (Claude, ChatGPT, GitHub Copilot, and others). The study app itself never calls an AI and stays local; this pack is separate and optional. You decide what to share with an AI tool.

The pack has one skill, `leaving-cert-tutor/`:

- `SKILL.md`: the tutor's rules and how to run each exercise type.
- `data/`: exercises and answer keys as JSON, built from the same data the app uses. Subjects: Applied Mathematics (about 8 generated problems for each of 24 topics, plus sketch tasks) and Russian (Higher Level).

Do not edit the files in `data/` by hand. After changing any exercise data or generator in the app, run `npm run build:ai-pack`; a test fails if the files are out of date.

The official exam papers and marking schemes are not in the pack. Paste the question text from your own copy when you want past paper practice.

## Use it

**Claude.** Zip the `leaving-cert-tutor` folder, then add it under Settings, Capabilities, Skills. In Claude Code, copy the folder to `.claude/skills/`. Then say, for example, "Let's practise Russian noun cases."

**GitHub Copilot (VS Code or CLI).** Copy the `leaving-cert-tutor` folder to `.github/skills/` in a repository, or to your personal skills folder. Ask in chat to practise a topic.

**ChatGPT.** Create a custom GPT. Paste the text of `SKILL.md` (without the lines between the `---` marks) into its instructions and upload the files from `data/` as knowledge. If a file is too big, split it by topic.

**Any other chat.** Paste the text of `SKILL.md`, then paste the one data file you need and say what you want to practise.

## Good to know

- The answer keys sit in the files, so the AI could show them early. The rules tell it not to.
- AI tutors make mistakes. The rule "check against the key" helps for drills, but for your own writing treat the feedback as a second opinion and ask your teacher about anything that surprises you.
- The Applied Mathematics problems are generated and their answers are computed by the app's code, but the topics and wording have not been checked by a teacher.
- The Russian content was reviewed by a model, not by a teacher.
