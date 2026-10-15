export interface TimelineEntry {
  title: string
  /** Dates aligned to the opposite edge of the title row. */
  period: string
  subtitle: string
}

export interface ContactLink {
  label: string
  href: string
  text: string
}

export interface Project {
  id: string
  name: string
  description: string
  stack: readonly string[]
  href: string
  color: string
  openSource: boolean
  video?: string
  videoHasAudio?: boolean
}

interface Profile {
  firstName: string
  lastName: string
  role: string
  intro: string
  location: string
  offScreen: string
}

export interface Portfolio {
  profile: Profile
  experience: readonly TimelineEntry[]
  projects: readonly Project[]
  education: readonly TimelineEntry[]
  contact: {
    pitch: string
    links: readonly ContactLink[]
  }
  /** Downloadable PDF CV, served from `public/cv`. */
  resume: string
}
