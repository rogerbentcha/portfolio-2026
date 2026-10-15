/** Interface strings. Portfolio content lives in `src/content`. */
export interface Messages {
  theme: { light: string; dark: string }
  navigation: {
    label: string
    about: string
    skip: string
  }
  sections: {
    experience: string
    projects: string
    education: string
    contact: string
  }
  projects: {
    openSource: string
    mute: string
    unmute: string
    openPreview: string
    closePreview: string
    preview: string
  }
  notFound: {
    pageTitle: string
    eyebrow: string
    title: string
    body: string
    back: string
  }
  routeError: {
    pageTitle: string
    eyebrow: string
    unknown: string
    back: string
  }
}
