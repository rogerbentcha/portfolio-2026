import { contactLinks, identity } from './shared'
import { getProjects } from './projects'
import type { Portfolio } from './types'

export const en: Portfolio = {
  profile: {
    ...identity,
    role: 'Full-stack software engineer',
    intro:
      'Nearly three years as a work-study developer on B2C and B2B platforms in production. I start from the front end and go all the way to the back end, the cloud and CI/CD.',
    location: 'Paris, France',
    offScreen: 'Off screen: football, running, weight training, drawing',
  },
  experience: [
    {
      title: 'Hellio',
      period: '10/2024 - 09/2026',
      subtitle: 'Full-stack JavaScript/TypeScript developer, work-study',
    },
    {
      title: 'Preciyus Studio',
      period: '11/2023 - 09/2024',
      subtitle: 'Full-stack JavaScript/TypeScript developer, work-study',
    },
  ],
  projects: getProjects('en'),
  education: [
    {
      title: "Master's in Software Architecture",
      period: '2024 - 2026',
      subtitle: "ESGI Paris · Master's level, RNCP level 7",
    },
    {
      title: "Bachelor's in Software Architecture",
      period: '2023 - 2024',
      subtitle: 'ESGI Nantes',
    },
  ],
  contact: {
    pitch: "Write to me, I'll get back to you quickly.",
    links: contactLinks,
  },
  resume: '/cv/roger-bentcha-cv-2026-en.pdf',
}
