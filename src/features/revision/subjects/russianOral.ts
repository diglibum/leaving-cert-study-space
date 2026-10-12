import { shuffled } from '../problems/rng'
import type { Rng, SpeakExercise, SpeakPrompt } from '../problems/types'

/*
 * Speaking practice for the oral exam: question banks and tips. Cyrillic is
 * allowed here (see AGENTS.md). The questions are original and follow the
 * syllabus themes. The learner answers aloud and checks themselves; nothing
 * is recorded or sent anywhere.
 */

const q = (text: string, gloss: string): SpeakPrompt => ({ text, gloss })

interface Bank {
  instruction: string
  prompts: readonly SpeakPrompt[]
  tips: readonly string[]
  selfCheck: readonly string[]
}

export const oralBanks: Readonly<Record<string, Bank>> = {
  'ru-oral-narrative': {
    instruction:
      'The narrative conversation is the biggest oral part (40 marks): you talk about yourself and your life. Answer each question aloud in at least three sentences.',
    prompts: [
      q('Как тебя зовут и сколько тебе лет?', 'What is your name and how old are you?'),
      q('Расскажи о своей семье.', 'Tell me about your family.'),
      q('Где ты живёшь? Опиши свой дом или свою комнату.', 'Where do you live? Describe your home or your room.'),
      q('Что ты делаешь в свободное время?', 'What do you do in your free time?'),
      q('Что ты делал(а) в прошлые выходные?', 'What did you do last weekend?'),
      q('Какой у тебя любимый предмет в школе и почему?', 'What is your favourite school subject and why?'),
      q('Опиши свой обычный день в школе.', 'Describe your usual day at school.'),
      q('Куда ты ездил(а) в отпуск прошлым летом?', 'Where did you go on holiday last summer?'),
      q('Что ты будешь делать после школы?', 'What will you do after school?'),
      q('Кто твой лучший друг и какой он (какая она)?', 'Who is your best friend and what are they like?'),
      q('Какую музыку и какие фильмы ты любишь?', 'What music and films do you like?'),
      q('Что ты сегодня ел(а) на завтрак и что ты любишь готовить?', 'What did you eat for breakfast today and what do you like cooking?'),
      q('Расскажи о самом интересном дне в твоей жизни.', 'Tell me about the most interesting day of your life.'),
      q('Чем ты гордишься?', 'What are you proud of?'),
    ],
    tips: [
      'Prepare answers in the past, present and future: the examiner listens for tense control.',
      'Add a reason with потому что, a feeling and a detail to every answer.',
      'Ask for repetition politely (Повторите, пожалуйста) rather than going silent.',
    ],
    selfCheck: [
      'Did I use all three tenses?',
      'Did I give a reason or an opinion, not only a fact?',
      'Did I avoid long pauses and keep going?',
      'Did I check the cases after prepositions and numbers?',
    ],
  },
  'ru-oral-discursive-ireland': {
    instruction:
      'Discursive conversation (30 marks) on everyday life in Ireland and in a Russian-speaking community. Compare, give an opinion and justify it aloud.',
    prompts: [
      q('Чем школа в Ирландии отличается от школы в России?', 'How does school in Ireland differ from school in Russia?'),
      q('Какие праздники ты отмечаешь в Ирландии? Какие отмечают в России?', 'Which holidays do you celebrate in Ireland? Which are celebrated in Russia?'),
      q('Что едят в Ирландии и что едят в России?', 'What do people eat in Ireland and in Russia?'),
      q('Какая погода бывает в Ирландии и в России?', 'What is the weather like in Ireland and in Russia?'),
      q('Какой спорт популярен в Ирландии, а какой в России?', 'Which sports are popular in Ireland and which in Russia?'),
      q('Где ты хотел(а) бы побывать в России и почему?', 'Where would you like to visit in Russia and why?'),
      q('Как молодые люди проводят свободное время в Ирландии?', 'How do young people spend their free time in Ireland?'),
      q('Какие традиции есть в твоей семье?', 'What traditions does your family have?'),
      q('Какие связи существуют между Ирландией и Россией?', 'What links are there between Ireland and Russia?'),
      q('Что тебе нравится в жизни в Ирландии? Что не нравится?', 'What do you like and dislike about life in Ireland?'),
    ],
    tips: [
      'Use comparison words: в отличие от, так же как, больше, меньше, лучше, хуже.',
      'Give your opinion: по-моему, я думаю, что… , мне кажется, что…',
      'Use only facts you know are true; say "я не уверен(а)" rather than guess.',
    ],
    selfCheck: [
      'Did I compare, not just describe one country?',
      'Did I give and justify an opinion?',
      'Did I use at least two linking words?',
    ],
  },
  'ru-oral-discursive-culture': {
    instruction:
      'Discursive conversation (30 marks) on aspects of culture in a Russian-speaking community. Answer aloud with facts and your own view.',
    prompts: [
      q('Расскажи о России. Какая это страна?', 'Tell me about Russia. What kind of country is it?'),
      q('Какие города России ты знаешь? Что там можно увидеть?', 'Which Russian cities do you know? What can you see there?'),
      q('Какого русского писателя, поэта или композитора ты знаешь?', 'Which Russian writer, poet or composer do you know?'),
      q('Какие русские сказки ты знаешь? Расскажи одну.', 'Which Russian fairy tales do you know? Tell one.'),
      q('Какие русские праздники ты знаешь? Как их отмечают?', 'Which Russian holidays do you know? How are they celebrated?'),
      q('Какие русские блюда тебе нравятся?', 'Which Russian food do you like?'),
      q('Что ты знаешь о природе и животных России?', 'What do you know about the nature and animals of Russia?'),
      q('Какие виды спорта популярны в России?', 'Which sports are popular in Russia?'),
      q('Что ты знаешь о системе образования в России?', 'What do you know about the education system in Russia?'),
      q('Почему важно изучать другие языки и культуры?', 'Why is it important to learn other languages and cultures?'),
    ],
    tips: [
      'Learn five solid facts about each of three topics: the exam asks for three.',
      'Say the fact, then your view on it, then compare with Ireland.',
      'Prepare names in Russian: cities, rivers, lakes, writers and composers.',
    ],
    selfCheck: [
      'Did I give correct facts, not guesses?',
      'Did I add my own view?',
      'Did I use the right cases for place names?',
    ],
  },
  'ru-oral-contemporary': {
    instruction:
      'Discursive conversation (30 marks) on contemporary life in a Russian-speaking community: young people, media, technology, work. Answer aloud with an opinion.',
    prompts: [
      q('Какую роль играет интернет в жизни подростков?', 'What role does the internet play in teenagers\' lives?'),
      q('Как ты пользуешься телефоном? Это хорошо или плохо?', 'How do you use your phone? Is it good or bad?'),
      q('Как современные подростки в России проводят время?', 'How do teenagers in Russia spend their time today?'),
      q('Какие профессии сегодня популярны?', 'Which professions are popular today?'),
      q('Какую подработку ты хотел(а) бы иметь?', 'What part-time job would you like to have?'),
      q('Что такое здоровый образ жизни?', 'What is a healthy lifestyle?'),
      q('Какие экологические проблемы существуют в твоём городе?', 'What environmental problems exist in your town?'),
      q('Что нужно делать, чтобы беречь природу?', 'What should we do to protect nature?'),
      q('Как люди общаются сегодня и как они общались раньше?', 'How do people communicate today and how did they before?'),
      q('Нужно ли учиться в университете, чтобы найти хорошую работу?', 'Is university necessary to get a good job?'),
    ],
    tips: [
      'Prepare the vocabulary: интернет, социальные сети, работа, зарплата, здоровье, экология.',
      'Give two sides: с одной стороны… с другой стороны…',
      'Finish with a clear conclusion: поэтому я считаю, что…',
    ],
    selfCheck: [
      'Did I give both sides of the issue?',
      'Did I reach a conclusion?',
      'Did I keep to Russian when I could not find a word (describe it)?',
    ],
  },
  'ru-oral-project': {
    instruction:
      'You chose the project option (30 marks). Rehearse presenting your project and answering questions on it: say each answer aloud in full sentences.',
    prompts: [
      q('Расскажи, какую тему ты выбрал(а) для проекта и почему.', 'Tell me which topic you chose for your project and why.'),
      q('Что ты узнал(а) нового, когда готовил(а) проект?', 'What new things did you learn while preparing the project?'),
      q('Откуда ты брал(а) информацию?', 'Where did you get the information from?'),
      q('Что было самым интересным в этой теме?', 'What was most interesting about this topic?'),
      q('Что было самым трудным в работе над проектом?', 'What was hardest about working on the project?'),
      q('Как эта тема связана с жизнью в Ирландии?', 'How does this topic relate to life in Ireland?'),
      q('Что ты ещё хотел(а) бы узнать об этой теме?', 'What else would you like to learn about this topic?'),
      q('Как ты думаешь, будет ли эта тема важной через десять лет?', 'Do you think the topic will be important in ten years?'),
      q('Если бы у тебя было больше времени, что бы ты изменил(а) в проекте?', 'If you had more time, what would you change in the project?'),
      q('Можешь коротко пересказать главные факты своего проекта?', 'Can you briefly retell the main facts of your project?'),
    ],
    tips: [
      'Pick a topic on the syllabus (culture, Ireland and Russia links, contemporary life) and ask your teacher to approve it.',
      'Prepare a short text and a word list, then practise the questions an examiner might ask about it.',
      'Be ready to go beyond the text: opinions, comparisons with Ireland, past and future.',
    ],
    selfCheck: [
      'Did I show more than a memorised text?',
      'Did I answer follow-up questions with full sentences?',
      'Did I use the project vocabulary correctly?',
    ],
  },
}

export function speakFromBank(topicId: string, rng: Rng, count = 5): SpeakExercise | undefined {
  const bank = oralBanks[topicId]
  if (!bank) return undefined
  const prompts = shuffled(rng, bank.prompts)
  return {
    kind: 'speak',
    topicId,
    lang: 'ru',
    instruction: bank.instruction,
    prompts: prompts.slice(0, Math.min(count, prompts.length)),
    tips: bank.tips,
    selfCheck: bank.selfCheck,
  }
}
