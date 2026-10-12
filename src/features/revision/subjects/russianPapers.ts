/** Where each exam part sits in the official Higher Level papers, described in our own words (see exam-papers/). */
export type PaperPart = 'comprehension' | 'structuring' | 'grammar' | 'essay' | 'guided' | 'aural'

export interface PaperRef {
  year: number
  /** Own-words description of the question or section for that year. */
  text: string
}

export const paperYears = [2019, 2021, 2022, 2023, 2024, 2025, 2026] as const

export const paperRefs: Record<PaperPart, readonly PaperRef[]> = {
  comprehension: [
    {
      year: 2019,
      text: 'Q1 is Vadim\'s personal letter about school progress, sport, class events and home life, with detail questions plus cases and a short cultural-awareness note. Q2 is a four-voice survey on women in society, followed by verb infinitives and a family semantic field.',
    },
    {
      year: 2021,
      text: 'Choice year: Q1 is a blog profile of teenage singer Liza, with detail questions plus either noun cases or a music semantic field. Q2 is four teenagers discussing career choices, followed by verb infinitives or parts of speech.',
    },
    {
      year: 2022,
      text: 'Choice year: Q1 follows budget-travel writer Roman, with detail questions plus either verb infinitives or parts of speech. Q2 is four accounts of studying Russian or attending Russian universities, followed by a higher-education semantic field or noun cases.',
    },
    {
      year: 2023,
      text: 'Q1 is a last-day-of-school friendship story about Denis and Kolya, with detail questions plus either verb infinitives or noun cases. Q2 gives four gifted-child profiles, followed by parts of speech or a music semantic field from section 1.',
    },
    {
      year: 2024,
      text: 'Q1 is a Paustovsky cat story about the village thief becoming a household guardian, with detail questions plus either verb infinitives or parts of speech. Q2 gives four views on teenage work, followed by an employment semantic field or noun cases.',
    },
    {
      year: 2025,
      text: 'Q1 explains the Last Bell school-leaving tradition and compares it with Ireland, with detail questions plus an education semantic field or parts of speech. Q2 is a four-voice text on language learning and bilingualism, followed by verb infinitives or noun cases.',
    },
    {
      year: 2026,
      text: 'Q1 is a winter adventure story about Seryozhka, Jack the dog and a rediscovered garage, with detail questions plus verb infinitives or a winter semantic field. Q2 summarises four graduates\' first-summer plans, then offers parts of speech or noun cases.',
    },
  ],
  structuring: [
    { year: 2019, text: 'Match 10 brief news items to 10 newspaper headings.' },
    { year: 2021, text: 'Match 10 short definitions to 10 TV programme genres.' },
    { year: 2022, text: 'Match 10 brief news items to 10 newspaper sections.' },
    { year: 2023, text: 'Match 10 profession definitions to 10 job titles.' },
    { year: 2024, text: 'Match 10 brief news items to 10 newspaper sections.' },
    { year: 2025, text: 'Match 10 brief news items to 10 newspaper sections.' },
    { year: 2026, text: 'Match 10 brief news items to 10 newspaper sections.' },
  ],
  grammar: [
    {
      year: 2019,
      text: 'Cloze on Oksana\'s route from childhood sport and music to chemistry studies at university.',
    },
    {
      year: 2021,
      text: 'Cloze on biathlete Kristina Ilchenko, from childhood dance to junior international sport.',
    },
    {
      year: 2022,
      text: 'Cloze on tennis player Anastasia Pavlyuchenkova, her sporting family and lifestyle.',
    },
    {
      year: 2023,
      text: 'Cloze travelogue about a family trip to Sochi, including the Olympic Park and beach holiday.',
    },
    {
      year: 2024,
      text: 'Cloze on New Year celebrations across Russia, from time zones and decorated trees to Ded Moroz.',
    },
    {
      year: 2025,
      text: 'Cloze on the cats of the Hermitage, their history, daily role and retirement.',
    },
    {
      year: 2026,
      text: 'Cloze on the history of pancakes, Maslenitsa and why blini became a national symbol.',
    },
  ],
  essay: [
    {
      year: 2019,
      text: '50-word factual essay: sport, education, family, religion or housing in the Russian Federation.',
    },
    {
      year: 2021,
      text: '50-word factual essay: a Russian city, Russian-Irish links, a political figure, festivals or the school system.',
    },
    {
      year: 2022,
      text: '50-word factual essay: Russian in Ireland, winter, a composer or artist or writer, natural attractions or public holidays.',
    },
    {
      year: 2023,
      text: '50-word factual essay: the capital, cultural figures, the education system, sport or transport.',
    },
    {
      year: 2024,
      text: '50-word factual essay: music or musicians, tourism, family, plants and wildlife, or youth culture.',
    },
    {
      year: 2025,
      text: '50-word factual essay: a famous actor, cities, climate, winter holidays or national cuisine.',
    },
    {
      year: 2026,
      text: '50-word factual essay: fauna, sightseeing, sport, the education system or fairy tales.',
    },
  ],
  guided: [
    {
      year: 2019,
      text: 'Letter to a pen pal about exams, summer and next year; narrative about a competition; discussion of women\'s role in modern society.',
    },
    {
      year: 2021,
      text: 'Letter on a concert or festival, or a cover letter for a summer job; narrative review of a favourite book or film, or a funny childhood memory; discussion of big-city living or choosing a career.',
    },
    {
      year: 2022,
      text: 'Letter on a trip to Russia, or an application for a Russian course; narrative on the best school day, or a review of a Russian film; discussion of healthy living or influencing as a career.',
    },
    {
      year: 2023,
      text: 'Letter organising a reunion, or persuading parents to allow an Ireland visit; narrative on a winter-holiday memory or a recent concert or festival; discussion of career choice or the challenges gifted children face.',
    },
    {
      year: 2024,
      text: 'Letter from Lyonka about the reformed cat, or an enquiry about summer-camp team-leading; narrative on a memorable school trip or Masha\'s first day in a part-time job; discussion of tradition or keeping a pet.',
    },
    {
      year: 2025,
      text: 'Letter about post-exam plans, or an enquiry about a graduation boat trip; narrative on a memorable show, or Alexandra\'s blog about a Skype exchange; discussion of learning about cultures or being a tour guide.',
    },
    {
      year: 2026,
      text: 'Letter from Seryozhka about adopting a shelter pet, or an enquiry about zoo volunteering; narrative about unexpected help, or Maria\'s Europe-trip blog; discussion of study-leisure balance or staying home for college versus moving away.',
    },
  ],
  aural: [
    {
      year: 2019,
      text: 'Section I has five short dialogues on a hotel taxi, English classes, a doctor\'s visit, evening plans and another taxi booking. Section II follows Maria and Irish dancing; Section III promotes a festival, film and awards event; Section IV is on Michael Fassbender. Recording and transcript exist.',
    },
    {
      year: 2021,
      text: 'Brief conversations cover family holidays, Andrei\'s interests, a vet visit and an early taxi. The interview is with Victor about Gaelic football; the adverts sell travel and museum visits; the biography follows Sasha\'s education, Instagram rules and blogging advice. Recording and transcript exist.',
    },
    {
      year: 2022,
      text: 'Brief conversations cover a children\'s class, Masha\'s visit, a ticket purchase and a shop item. The interview follows Eric\'s Russian-school experience; the adverts promote a dog gadget, a sports hotel, language study and a book; the biography is about Olga\'s career. Recording and transcript exist.',
    },
    {
      year: 2023,
      text: 'Brief conversations cover a doctor\'s visit, a ticket purchase and shopping advice. The interview is with Emily about studying Russian and living in Moscow; the adverts sell warm-weather, ski and Russia tours; the biography follows Vlad\'s family, surname, hobbies and a 2020 turning point. Recording and transcript exist.',
    },
    {
      year: 2024,
      text: 'Brief conversations cover a salon booking, apartment hunting and parcel delivery. The interview follows maths Olympiad student Galiia; the adverts promote a chocolate masterclass, skating lessons and a delivery service; the biography is about Yuri Nikulin. Recording and transcript exist.',
    },
    {
      year: 2025,
      text: 'Brief conversations cover a hotel booking, dry cleaning and metro directions. The interview follows Yelena on Irish dance and video projects; the adverts promote a trip, a ticketed leisure venue and dumplings; the biography is about Anton Chekhov. Recording and transcript exist.',
    },
    {
      year: 2026,
      text: 'Brief conversations cover student work, a shop complaint and meeting a grandmother. The interview follows Peter learning Russian; the adverts promote a coworking space, a summer camp and a course; the biography is about Elena\'s singing career and music academy. Recording and transcript exist.',
    },
  ],
}

export function paperFile(year: number, kind: 'paper' | 'marking-scheme' | 'aural-paper' | 'recording'): string {
  if (kind === 'recording') {
    if (year === 2020) {
      throw new Error('No 2020 Higher Level Russian recording is stored in this repository.')
    }

    return `exam-papers/sec/audio/${year}-russian-aural-recording.mp3`
  }

  if (kind === 'aural-paper') {
    if (year === 2020) {
      throw new Error('No 2020 Higher Level Russian aural paper is stored in this repository.')
    }

    return `exam-papers/sec/${year}-russian-higher-aural-paper.pdf`
  }

  if (kind === 'marking-scheme') {
    return `exam-papers/sec/${year}-russian-higher-marking-scheme.pdf`
  }

  return `exam-papers/sec/${year}-russian-higher-paper.pdf`
}
