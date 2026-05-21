"use client"

import type { ReactNode } from "react"
import { motion, type HTMLMotionProps, type Variants } from "motion/react"

type InViewProps = {
  children: ReactNode
  className?: string
  variants?: Variants
  viewOptions?: HTMLMotionProps<"div">["viewport"]
}

export function InView({ children, className, variants, viewOptions }: InViewProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewOptions}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
