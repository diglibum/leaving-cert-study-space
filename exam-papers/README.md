# Exam papers

Official State Examinations Commission (SEC) papers kept for personal exam
preparation and as the source of truth for the question bank.

**The files are not committed.** The repository is public, so this folder is
git-ignored except for this README. To use the tasks that point to a paper,
download the file from the source in the table below and save it under the name
shown (for example `exam-papers/sec/2024-russian-higher-paper.pdf`). The table
lists what the author keeps locally.
| File | Document | Source |
| --- | --- | --- |
| `sec/2023-english-higher-paper-1.pdf` | Leaving Certificate English, Higher Level, Paper 1, 2023 | https://www.examinations.ie/archive/exampapers/2023/LC002ALP100EV.pdf |
| `sec/2024-english-higher-paper-1.pdf` | Leaving Certificate English, Higher Level, Paper 1, 2024 | https://www.examinations.ie/archive/exampapers/2024/LC002ALP100EV.pdf |
| `sec/2025-english-higher-paper-1.pdf` | Leaving Certificate English, Higher Level, Paper 1, 2025 | https://www.examinations.ie/archive/exampapers/2025/LC002ALP100EV.pdf |
| `sec/2026-english-higher-paper-1.pdf` | Leaving Certificate English, Higher Level, Paper 1, 2026 | https://www.examinations.ie/archive/exampapers/2026/LC002ALP100EV.pdf |
| `sec/2023-english-higher-marking-scheme.pdf` | Marking scheme, English, Higher Level (Papers 1 and 2), 2023 | https://www.examinations.ie/archive/markingschemes/2023/LC002ALP000EV.pdf |
| `sec/2024-english-higher-marking-scheme.pdf` | Marking scheme, English, Higher Level (Papers 1 and 2), 2024 | https://www.examinations.ie/archive/markingschemes/2024/LC002ALP000EV.pdf |
| `sec/2025-english-higher-marking-scheme.pdf` | Marking scheme, English, Higher Level (Papers 1 and 2), 2025 | https://www.examinations.ie/archive/markingschemes/2025/LC002ALP000EV.pdf |
| `sec/2026-english-higher-marking-scheme.pdf` | Marking scheme, English, Higher Level (Papers 1 and 2), 2026 | https://www.examinations.ie/archive/markingschemes/2026/LC002ALP000EV.pdf |
| `sec/2023-applied-maths-higher-paper.pdf` to `sec/2026-applied-maths-higher-paper.pdf` | Leaving Certificate Applied Mathematics, Higher Level, 2023 to 2026 | https://www.examinations.ie/archive/exampapers/YEAR/LC020ALP000EV.pdf |
| `sec/2023-applied-maths-higher-marking-scheme.pdf` to `sec/2026-applied-maths-higher-marking-scheme.pdf` | Marking schemes, Applied Mathematics, Higher Level, 2023 to 2026 | https://www.examinations.ie/archive/markingschemes/YEAR/LC020ALP000EV.pdf |
| `sec/assets.gov.ie_static_documents_54a1450c_FINAL_v2_English_Assessment_Arrangements_2027.pdf` | Assessment arrangements for 2027 (Applied Mathematics section: 8 of 10 questions, strands 2 to 4) | gov.ie |
| `sec/2019-russian-higher-paper.pdf`, `sec/2020-...`, `sec/2021-...` to `sec/2026-russian-higher-paper.pdf` | Leaving Certificate Russian, Higher Level, written paper, 2019 to 2026 | https://www.examinations.ie/archive/exampapers/YEAR/LC099ALP000BV.pdf |
| `sec/YEAR-russian-higher-marking-scheme.pdf` (2019 to 2026) | Marking schemes, Russian, Higher Level, including the aural marking scheme and transcripts (Appendix 2) | https://www.examinations.ie/archive/markingschemes/YEAR/LC099ALP000EV.pdf |
| `sec/YEAR-russian-higher-aural-paper.pdf` (2019, 2021 to 2026) | Aural paper (questions), Russian, Higher Level | https://www.examinations.ie/archive/exampapers/YEAR/LC099ALPA00BV.pdf |
| `sec/audio/YEAR-russian-aural-recording.mp3` (2019, 2021 to 2026) | Aural recordings, about 75 MB each; kept on this machine only and git-ignored | https://www.examinations.ie/archive/exampapers/YEAR/LC099ZLP017BV.mp3 (EV in 2019 and 2021) |
| `sec/russian-syllabus.pdf` | Leaving Certificate Russian syllabus (NCCA) | https://www.curriculumonline.ie/getmedia/acc9679a-b9ed-42bd-9b4a-26ffa7b562db/SCSEC31_Russian_syllabus_eng.pdf |
| `russian/LC099ALP000BV.pdf` | Leaving Certificate Russian, Higher Level, written paper, 2026 (Section I 120 marks, Section II 100 marks; Monday 22 June, 9:30 to 12:00) | provided by the learner |

The original SEC files are unmodified. Downloaded on 2026-10-11, and the Russian
files later. The file in `russian/` was added by the learner. The app never copies paper
text: it points to past papers by year and question, with descriptions written
for the app, and the learner opens the file named in the task. Only Higher Level
Russian is kept.

The marking schemes list the focus and the P (purpose), C (coherence), L (language),
and M (mechanics) descriptors for each composing task. Use them as the source
for self-check criteria. SEC notes that marking schemes are working documents
for trained examiners, so the app should present them as guidance, not as
exam marks.

## Copyright

The papers are published by the SEC for students, but they include texts and
images owned by third parties. Each paper carries this notice: any use for a
purpose other than the intended purpose is not authorised, and the SEC accepts
no liability for unauthorised distribution.

For that reason:

- Never commit these files or publish them in a public repository. The folder is
  git-ignored for that reason.
- Do not put these files under `public/` or `src/`, so they are never bundled
  into the app or served by it.
- The app may show only the SEC-written composition task wording, never the
  copyrighted source texts or images. For Applied Mathematics the app only points
  to questions by year, number, and part, with short descriptions written for
  the app.
