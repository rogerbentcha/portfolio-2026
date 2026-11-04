import type { SVGProps } from 'react'

/** The pixel "R" from the favicon (same path, cropped to the glyph), drawn in `currentColor`. */
export function Monogram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 285 388" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M53 0H231V53H285V230H231V283H205V314H257V388H187V336H133V283H70V388H0V53H53ZM70 75H213V208H70Z"
      />
    </svg>
  )
}
