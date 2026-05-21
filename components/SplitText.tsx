"use client"

import { ElementType, useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type SplitTextProps = {
  text: string
  tag?: ElementType
  splitType?: "words" | "lines"
  delay?: number
  duration?: number
  ease?: string
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  rootMargin?: string
  textAlign?: "left" | "center" | "right"
  className?: string
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

const splitWordsMarkup = (text: string) =>
  text
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part
      return `<span class="split-text__word">${escapeHtml(part)}</span>`
    })
    .join("")

const startFromRootMargin = (rootMargin: string) => {
  const topMargin = rootMargin.split(/\s+/)[0] ?? "0px"
  const value = Number.parseInt(topMargin, 10)

  if (Number.isNaN(value) || value === 0) return "top 85%"
  return value < 0 ? `top bottom-=${Math.abs(value)}px` : `top bottom+=${value}px`
}

const syncContinuousGradient = (element: HTMLElement, targets: Element[]) => {
  if (!element.classList.contains("positioning-section__split-gradient")) return

  const lineBounds = element.getBoundingClientRect()
  element.style.setProperty("--split-gradient-track-width", `${lineBounds.width * 3}px`)

  targets.forEach((target) => {
    const word = target as HTMLElement
    const wordBounds = word.getBoundingClientRect()
    word.style.setProperty("--split-word-x", `${wordBounds.left - lineBounds.left}px`)
  })
}

export default function SplitText({
  text,
  tag: Tag = "p",
  splitType = "words",
  delay = 80,
  duration = 0.8,
  ease = "power3.out",
  from = { opacity: 0, y: 34 },
  to = { opacity: 1, y: 0 },
  rootMargin = "-100px",
  textAlign = "center",
  className = "",
}: SplitTextProps) {
  const elementRef = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const element = elementRef.current
      if (!element) return

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      let animation: gsap.core.Tween | null = null
      let gradientAnimation: gsap.core.Tween | null = null
      let resizeObserver: ResizeObserver | null = null
      let isActive = true

      const prepareAndAnimate = async () => {
        if ("fonts" in document) {
          await document.fonts.ready
        }

        if (!isActive || !elementRef.current) return

        element.innerHTML = splitWordsMarkup(text)

        let targets: Element[] = Array.from(element.querySelectorAll(".split-text__word"))

        if (splitType === "lines") {
          const words = targets as HTMLElement[]
          const lines = new Map<number, string[]>()

          words.forEach((word) => {
            const top = Math.round(word.offsetTop)
            const line = lines.get(top) ?? []
            line.push(word.textContent ?? "")
            lines.set(top, line)
          })

          element.innerHTML = Array.from(lines.values())
            .map((lineWords) => `<span class="split-text__line">${escapeHtml(lineWords.join(" "))}</span>`)
            .join("")

          targets = Array.from(element.querySelectorAll(".split-text__line"))
        }

        syncContinuousGradient(element, targets)

        if (element.classList.contains("positioning-section__split-gradient")) {
          resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => syncContinuousGradient(element, targets))
          })
          resizeObserver.observe(element)
        }

        if (reduceMotion) {
          gsap.set(targets, { clearProps: "all", opacity: 1, y: 0, filter: "none" })
          return
        }

        if (element.classList.contains("positioning-section__split-gradient")) {
          gradientAnimation = gsap.fromTo(
            element,
            { "--split-gradient-shift": "0px" },
            {
              "--split-gradient-shift": () => `-${element.getBoundingClientRect().width * 2}px`,
              duration: 2.5,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
          )
        }

        gsap.set(targets, from)

        animation = gsap.to(targets, {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: element,
            start: startFromRootMargin(rootMargin),
            once: true,
            toggleActions: "play none none none",
          },
        })

        ScrollTrigger.refresh()
      }

      prepareAndAnimate()

      return () => {
        isActive = false
        resizeObserver?.disconnect()
        gradientAnimation?.kill()
        animation?.scrollTrigger?.kill()
        animation?.kill()
        element.textContent = text
      }
    },
    { dependencies: [text, splitType, delay, duration, ease, rootMargin], scope: elementRef },
  )

  return (
    <Tag
      ref={elementRef}
      className={`split-text ${className}`.trim()}
      style={{ textAlign }}
      aria-label={text}
      suppressHydrationWarning
    >
      {text}
    </Tag>
  )
}
