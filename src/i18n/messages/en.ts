import type { Messages } from './types'

export const en: Messages = {
  theme: { light: 'Switch to the light theme', dark: 'Switch to the dark theme' },
  navigation: {
    label: 'Portfolio navigation',
    about: 'About',
    skip: 'Skip to content',
    resume: 'Download my CV',
  },
  sections: {
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    contact: 'Contact',
  },
  projects: {
    openSource: 'Open source',
    mute: 'Mute video',
    unmute: 'Unmute video',
    openPreview: 'Open in preview',
    closePreview: 'Close preview',
    preview: 'Video preview',
  },
  notFound: {
    pageTitle: 'Page not found · Roger BENTCHA',
    eyebrow: 'Error 404',
    title: 'Off the map',
    body: "This page doesn't exist or has moved.",
    back: 'Back to the portfolio',
  },
  routeError: {
    pageTitle: 'Error · Roger BENTCHA',
    eyebrow: 'Something broke',
    unknown: 'Unknown error',
    back: 'Back to home',
  },
}
