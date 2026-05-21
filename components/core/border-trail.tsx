"use client"

import type { CSSProperties } from "react"

type BorderTrailProps = {
  className?: string
  size?: number
  style?: CSSProperties
}

export function BorderTrail({ className = "", size = 80, style }: BorderTrailProps) {
  return (
    <span
      className={`border-trail ${className}`.trim()}
      style={{ "--border-trail-size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="border-trail__beam" style={style} />
    </span>
  )
}
