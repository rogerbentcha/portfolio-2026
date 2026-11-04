import type { ComponentProps } from 'react'

const isExternal = (href: string) => /^https?:\/\//.test(href)

/** Anchor that opens external URLs in a new tab. Styling comes from the base `a` rules. */
export function TextLink({ href, ...props }: ComponentProps<'a'> & { href: string }) {
  const external = isExternal(href)
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener' : undefined}
      {...props}
    />
  )
}
