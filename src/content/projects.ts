import type { Locale } from '@/i18n/locale'
import type { Project } from './types'

type ProjectDefinition = Omit<Project, 'description'> & {
  description: Record<Locale, string>
}

/** Project content; colors remain placeholders. */
const projects: readonly ProjectDefinition[] = [
  {
    id: 'ferry',
    name: 'Ferry',
    description: {
      en: 'Deploy from a Git repository, a folder or a Docker image with zero downtime. Add Postgres, Redis, cron jobs, custom domains and HTTPS, all on one server with Docker.',
      fr: 'Déployez depuis un dépôt Git, un dossier ou une image Docker, sans interruption de service. Ajoutez Postgres, Redis, des tâches cron, des domaines personnalisés et HTTPS, le tout sur un seul serveur avec Docker.',
    },
    stack: ['Rust', 'React', 'TypeScript', 'Next.js'],
    href: 'https://ferry-docs.rogerbentcha.fr',
    video: '/projects/ferry.mp4',
    openSource: true,
    color: '#4564e8',
  },
  {
    id: 'traduko',
    name: 'Traduko',
    description: {
      en: 'A small macOS translation app that runs locally on your Mac.',
      fr: 'Une petite application de traduction pour macOS qui fonctionne en local sur votre Mac.',
    },
    stack: ['Rust', 'GPUI', 'React', 'TypeScript'],
    href: 'https://traduko.rogerbentcha.fr/',
    video: '/projects/traduko.mp4',
    openSource: true,
    color: '#bf4a77',
  },
  {
    id: 'shaderlib',
    name: 'ShaderLib',
    description: {
      en: 'A React shader library with 10 effects available as components.',
      fr: 'Une bibliothèque de shaders React avec 10 effets sous forme de composants.',
    },
    stack: ['React', 'TypeScript', 'WebGPU'],
    href: 'https://shaderui.rogerbentcha.fr/',
    video: '/projects/shaderlib.mp4',
    videoHasAudio: false,
    openSource: true,
    color: '#008579',
  },
  {
    id: 'ferry-ui',
    name: 'FerryUI',
    description: {
      en: 'A React design system for dashboards, admin consoles and developer tools.',
      fr: 'Un design system React pour les tableaux de bord, les consoles d’administration et les outils de développement.',
    },
    stack: ['React', 'Tailwind CSS', 'TypeScript', 'Radix UI', 'Storybook'],
    href: 'https://ferry-ui.rogerbentcha.fr/',
    video: '/projects/ferry-ui.mp4',
    videoHasAudio: true,
    openSource: true,
    color: '#b45b20',
  },
  {
    id: 'layout-guide',
    name: 'Layout Guide',
    description: {
      en: 'Figma’s layout guides, in your browser.',
      fr: 'Les guides de mise en page de Figma, dans le navigateur.',
    },
    stack: ['React', 'Tailwind CSS'],
    href: 'https://github.com/Carter2307/layout-guides',
    video: '/projects/layout-guide.mp4',
    videoHasAudio: true,
    openSource: true,
    color: '#8456c7',
  },
]

export function getProjects(locale: Locale): readonly Project[] {
  return projects.map((project) => ({ ...project, description: project.description[locale] }))
}
