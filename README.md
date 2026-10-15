# Portfolio — React · Vite · TypeScript · ferry-shaders · ferry-ui

Portfolio bilingue de Roger BENTCHA, avec une interface sobre et dense.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # TypeScript + production build
npm run lint     # oxlint
```

## Interface

La page `/` propose une navigation latérale sur ordinateur et horizontale sur mobile, un fond
blanc en mode clair ou sombre, le nom « Roger BENTCHA » et des titres non numérotés en Pixelify Sans. Le texte courant est
en 13 px. Les expériences affichent uniquement l’entreprise, les dates et le rôle ; les formations
affichent le diplôme, les dates et l’école en plus petit. Les dates restent à droite sur la ligne
du titre, y compris sur mobile. Les projets précèdent les expériences dans la page et la navigation,
sans séparateurs horizontaux entre les sections. Le logo latéral s’affiche sans le nom.
Un lien « Télécharger le CV » clôt la navigation et télécharge le PDF de `public/cv` dans la langue du site.
L’adresse e-mail est masquée par défaut
et se révèle au survol ou au focus clavier.

Motion React révèle les blocs de texte, la navigation et les projets une fois à leur entrée dans l’écran :
fondu de 700 ms, déplacement de 4 px et décalage de 100 ms entre les éléments.
`prefers-reduced-motion` désactive l’effet. Les fonctions d’animation sont chargées séparément
avec `LazyMotion`.

Lenis adoucit le défilement à la molette et les liens vers les sections, en respectant les marges
de défilement et `prefers-reduced-motion`. Le défilement tactile reste natif. Les barres de défilement
sont masquées sans désactiver le défilement à la souris, au clavier ou au toucher.

## Shaders

Deux composants `<Drift>` du paquet npm `ferry-shaders` affichent des nuages de bruit tramé.
La bande supérieure reste fixe en haut de l’écran (320 px sur ordinateur, 200 px sur mobile).
Le contenu s’efface sous elle en remontant, tandis que la navigation latérale et le bouton de thème
restent accessibles. La bande inférieure épouse la hauteur du footer pour éviter une démarcation
à son bord supérieur. Les couleurs suivent les tokens de ferry-ui ; vitesse 1,5 et plafond de 30 images
par seconde. Sans WebGPU, un motif CSS fixe prend le relais.

La bibliothèque partage le device GPU entre les canvas, suspend les animations hors écran et
suit `prefers-reduced-motion` (une image fixe).

## Projets

Les cinq projets — Ferry, Traduko, ShaderLib, FerryUI et Layout Guide — se configurent dans
`src/content/projects.ts` : nom, description bilingue, stack, URL, statut open source et couleur
unique, vidéo et présence d’une piste audio. Les couleurs restent provisoires. Les cinq vidéos
locales de `public/projects` tournent en boucle, sans contrôles natifs et avec le son coupé au départ.
Un badge « Open source », le bouton de son des vidéos concernées et un bouton d’agrandissement
s’affichent au-dessus de l’aperçu. Un clic sur la vidéo ou sur le bouton d’agrandissement ouvre
un lecteur en boucle, sans contrôles natifs, sur un voile blanc translucide et flouté.
Une infobulle suit le curseur au survol de la vidéo. Un clic sur le voile, le bouton de fermeture
ou la touche Échap ramène la vidéo à sa position initiale ; `prefers-reduced-motion` désactive
le mouvement. La position de lecture et le choix du son sont conservés, et la vidéo de la carte
est suspendue pendant l’aperçu. La fenêtre modale retient le focus et le restitue au bouton d’ouverture.
ShaderLib n’affiche pas de bouton de son car sa vidéo est muette. Les vidéos inactives ou hors écran
sont mises en pause.
Sur ordinateur, le premier projet est affiché par défaut ; le survol ou le focus d’un autre nom
révèle sa carte et la dernière sélection reste active. Une grille superposée réserve la hauteur
de la carte la plus haute pour que les expériences ne bougent pas lors d’un changement de projet.
Les cartes inactives sont masquées et retirées des interactions et de l’arbre d’accessibilité.
Le nom, la description et la stack restent des liens natifs vers le projet. Sur une colonne étroite,
les descriptions et stacks restent visibles ; un tap sur la vidéo ouvre son aperçu.
Les cartes empilent un aperçu pleine largeur au format 16:9, la description puis la stack en Pixelify Sans.
Elles ont des angles droits, sans bordure ni ombre.

Un connecteur élastique relie le nom actif à sa carte : des ressorts pilotent sa forme et un shader
WGSL l’affiche via `ferry-shaders/core`, sur le même device WebGPU que les champs de pixels.
Le mouvement du pointeur déforme la bande, qui revient au repos. Le calcul s’arrête quand elle
est stable, hors écran ou quand l’onglet est masqué. Sans WebGPU, un SVG prend le relais ;
`prefers-reduced-motion` affiche la courbe au repos.

## Structure

```text
src/
├── app/layouts/              # cadre de la page
├── pages/home/               # page, hero et section contact
├── pages/not-found/          # page introuvable
├── pages/route-error/        # gestion des erreurs
├── features/edge-field/      # Drift fixe en haut et fondu du footer
├── features/projects/        # cartes vidéo, connecteur WebGPU et repli SVG
├── features/smooth-scroll/   # cycle de vie de Lenis
├── components/layout/        # navigation et footer
├── components/ui/            # sections, timeline, liens, monogramme
├── lib/                      # animations Motion React
├── i18n/                     # détection de langue et textes d’interface
├── content/                  # contenu typé du CV en français et anglais
└── styles/index.css          # Tailwind v4 et styles du portfolio
```

## Langues

Anglais par défaut. Si la langue principale du navigateur est le français (`fr`, `fr-FR`, `fr-CA`…),
le site s’affiche en français et `<html lang>` suit. Le contenu du CV reste dans `src/content/en.ts`
et `fr.ts`, et les textes d’interface dans `src/i18n/messages/`. TypeScript vérifie que les deux
langues exposent les mêmes clés. Le bouton de téléchargement sert `public/cv/roger-bentcha-cv-2026-fr.pdf`
en français et `public/cv/roger-bentcha-cv-2026-en.pdf` sinon.

## Thèmes

`ThemeProvider` et les boutons `Button` de ferry-ui pilotent les thèmes clair/sombre. Le thème
suit le système lors de la première visite, puis le choix manuel est mémorisé sous `portfolio-theme`.
Le script `themeInitScript` de ferry-ui est injecté dans `<head>` par Vite avant le premier affichage.
Les couleurs du texte, du fond et des shaders suivent les tokens. Les boutons de thème ont un
fond translucide avec flou d’arrière-plan.
