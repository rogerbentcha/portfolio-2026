import { contactLinks, identity } from './shared'
import { getProjects } from './projects'
import type { Portfolio } from './types'

export const fr: Portfolio = {
  profile: {
    ...identity,
    role: 'Software engineer full-stack',
    intro:
      "Près de trois ans d'alternance sur des plateformes B2C et B2B en production. Je pars du front-end et je vais jusqu'au back-end, au cloud et à la CI/CD.",
    location: 'Paris, Île-de-France',
    offScreen: 'Hors écran : football, running, musculation, dessin',
  },
  experience: [
    {
      title: 'Hellio',
      period: '10/2024 - 09/2026',
      subtitle: 'Développeur full-stack JavaScript/TypeScript, alternance',
    },
    {
      title: 'Preciyus Studio',
      period: '11/2023 - 09/2024',
      subtitle: 'Développeur full-stack JavaScript/TypeScript, alternance',
    },
  ],
  projects: getProjects('fr'),
  education: [
    {
      title: 'Master Architecture des Logiciels',
      period: '2024 - 2026',
      subtitle: 'ESGI Paris · Bac+5, titre RNCP niveau 7',
    },
    {
      title: 'Bachelor Architecture Logicielle',
      period: '2023 - 2024',
      subtitle: 'ESGI Nantes',
    },
  ],
  contact: {
    pitch: 'Écrivez-moi, je réponds vite.',
    links: contactLinks,
  },
  resume: '/cv/roger-bentcha-cv-2026-fr.pdf',
}
