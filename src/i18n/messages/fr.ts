import type { Messages } from './types'

export const fr: Messages = {
  theme: { light: 'Passer au thème clair', dark: 'Passer au thème sombre' },
  navigation: {
    label: 'Navigation du portfolio',
    about: 'À propos',
    skip: 'Aller au contenu',
    resume: 'Télécharger le CV',
  },
  sections: {
    experience: 'Expérience',
    projects: 'Projets',
    education: 'Formation',
    contact: 'Contact',
  },
  projects: {
    openSource: 'Open source',
    mute: 'Couper le son',
    unmute: 'Activer le son',
    openPreview: 'Ouvrir l’aperçu',
    closePreview: 'Fermer l’aperçu',
    preview: 'Aperçu vidéo',
  },
  notFound: {
    pageTitle: 'Page introuvable · Roger BENTCHA',
    eyebrow: 'Erreur 404',
    title: 'Hors carte',
    body: "Cette page n'existe pas ou a été déplacée.",
    back: 'Retour au portfolio',
  },
  routeError: {
    pageTitle: 'Erreur · Roger BENTCHA',
    eyebrow: 'Quelque chose a cassé',
    unknown: 'Erreur inconnue',
    back: "Revenir à l'accueil",
  },
}
