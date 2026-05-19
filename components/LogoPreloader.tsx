"use client"

import { useEffect, useId, useRef, useState } from "react"
import { gsap } from "gsap"
import Grainient from "./Grainient"

const VIEW_BOX_WIDTH = 399.72
const VIEW_BOX_HEIGHT = 416.9
const MASK_OVERSHOOT_FACTOR = 9.5
const SCALE_DURATION = 0.8
const SCALE_EASE = "sine.inOut"

const GRAINIENT_PROPS = {
  color1: "#0a1e66",
  color2: "#0c30b1",
  color3: "#0a1e66",
  timeSpeed: 1.7,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5.6,
  warpSpeed: 2,
  warpAmplitude: 47,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.06,
  grainScale: 2,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
}

const SHIELD_PATHS = [
  "M399.36,98.84c-.16-4.36-.46-8.7-.91-13.01-.03-.32-.26-.59-.58-.66-11.11-2.7-22.16-5.91-33.14-9.62-31.43-10.5-61.66-23.28-92.11-37.81C247.99,26,223.79,13.44,200.01.05c-.12-.06-.26-.06-.37,0-21.42,12.1-43.26,23.53-65.5,34.3l-35.4,16.34c-32.09,14.3-64.07,26.09-97.19,34.64-.22.05-.37.24-.39.46C.06,102.64-.26,119.47.21,136.28l.33,6.56.34,7.34c.63,11.26,1.61,22.47,2.94,33.61.57,4.66,1.56,10.97,2.95,18.94,3.56,20.33,8.85,40.41,17.01,58.81l6.49,13.35.85,1.63,4.65,7.63,1.59,2.68c9.1,13.99,19.09,27.18,29.96,39.59l9.18,9.96,10.53,10.51c13.2,12.55,27.31,23.91,42.32,34.1,8.67,5.93,17.56,11.38,26.66,16.36,8.25,4.62,16.7,8.78,25.36,12.49l18.15,7c.26.1.56.1.82,0,16.38-5.73,32.13-12.98,47.26-21.75,9.52-5.35,18.78-11.23,27.8-17.65l10.44-7.65c9.81-7.56,19.2-15.62,28.15-24.2l9.44-9.46,9.53-10.44,9.42-11.28,14.29-19.33,8.38-12.55,7.54-13.71,2.81-6.08c2.77-6.22,5.1-12.17,6.97-17.84,5.69-17.22,9.81-35.12,12.35-53.7l1.14-7.92c1.67-13.53,2.78-27.09,3.34-40.68l.26-9.04c.32-11.57.27-23.14-.15-34.7ZM398.93,121.05s.01-.04,0-.06c0,.02,0,.04,0,.06ZM398.9,120.9s0,.03.02.04c-.01-.02-.02-.05-.05-.07.01,0,.02.02.03.03ZM398.81,120.87s-.04,0-.05,0c.02,0,.03,0,.05,0ZM398.68,120.92s.02-.02.04-.03c-.01.01-.03.02-.04.04,0,0,0,0,0,0ZM375.95,129.4c0,.06,0,.11.01.17-.01-.05,0-.11-.01-.17ZM376.03,129.72s.04.1.07.14c-.03-.04-.05-.1-.07-.14ZM376.65,130.19c-.05,0-.1-.04-.15-.05.06.02.11.05.17.06,0,0-.01,0-.02,0ZM376.22,129.97s.08.08.12.11c-.05-.03-.08-.07-.12-.11ZM292.02,334.83l-11.5,9.58c-14.02,11.44-28.88,21.69-44.6,30.76-10.11,5.87-20.58,11.04-31.4,15.5-3.32,1.36-4.42,2.04-7.51.73-10.35-4.41-18.61-8.25-24.79-11.53-18.44-9.95-35.78-21.48-52.01-34.62l-12.27-10.3-10.5-9.89c-3.61-3.47-7.09-6.95-10.43-10.42-.75-.78-1.33-1.5-1.72-2.16-.21-.35-.47-.68-.78-.96-2.19-2.06-3.97-4.09-5.34-6.09-.93-1.35-2.26-2.46-3.3-3.91-3.57-4.95-7.01-9.9-10.33-14.87l-1.58-2.63-5.95-9.39-7.94-14.41c-3.49-7.13-6.44-14.49-8.87-22.07-4.13-12.35-7.4-24.96-9.81-37.82-.87-4.61-1.55-9.25-2.06-13.92-.13-1.18-.33-2.35-.62-3.5-.18-2.34-.46-4.66-.85-6.97-.47-2.83-.31-5.39-.92-7.93-.7-2.93-.35-6.02-.88-9.38-.41-2.65-.6-5.32-.56-8.02l-.91-15.66-.04-30.05c0-.22.15-.42.37-.47,6.07-1.38,12.6-3.16,19.6-5.33,20.16-6.26,40.55-13.69,61.16-22.29,31.25-13.05,61.96-27.44,92.11-43.18,1.11-.78,2.04-.97,2.81-.58,5.26,2.68,10.46,5.33,15.6,7.95,26.39,13.29,53.16,25.57,80.33,36.83,19.66,8.15,39.22,15.24,58.67,21.27,6.52,2.02,13,3.78,19.45,5.3.46.1.78.51.79.98l.13,8.53-.84,29.67c-.67,12.35-1.8,24.58-3.38,36.68l-.45,3.09-1.06,7.53c-3.83,24.48-10.3,48.9-21.06,71.31l-4.03,7.5-8.87,14.08-7.29,11.29c-3.01,4.03-6.11,8.03-9.29,11.99-1.72,2.14-4.06,4.68-7.03,7.63-3.19,3.16-6.23,6.47-9.13,9.93l-11.12,10.22Z",
  "M337.22,251.85c2.44-4.31,3.68-8.38,6.05-14.66,1.83-4.87,3.17-10.11,4.76-15.19,1.9-6.1,3.97-15.48,6.21-28.15l1.25-4.31,2.49-13.04c2.53-15.63,3.98-31.45,4.35-47.46l.04-14.72c0-.18-.14-.33-.32-.34-.74-.04-1.52-.17-2.33-.38-12.94-3.4-25.64-7.4-38.11-11.98-16.12-5.87-31.96-12.3-47.52-19.3-24.6-11.06-49.14-23.22-73.61-36.49-.4-.22-.89-.21-1.29,0-32.91,17.96-66.53,34-100.86,48.12-5.49,2.26-13.31,5.2-23.44,8.82-12.19,4.45-24.6,8.21-37.23,11.31-.22.05-.38.25-.39.48l-.15,6.23c-.08,5.47.69,11.23.7,16.22.01,4.54-.16,6.8.36,10.02.6,3.78.37,7.29,1.02,11.41.85,5.4,1.35,10.85,2.22,16.24.79,5.63,1.94,11.13,3.45,16.51,1.91,10.6,3.71,19.2,5.39,25.78,1.13,4.41,3.03,10.61,5.71,18.61l5.54,14.26c3.31,8.45,7.6,15.43,12.8,23.57,7.49,11.66,15.81,22.61,24.96,32.87,4.95,5.69,10.13,11.09,15.55,16.19,8.92,8.4,18.05,16.34,27.89,23.61,12.99,9.72,26.7,18.23,41.11,25.53,4.96,2.51,9.91,4.72,14.84,6.62.78.3,1.65.3,2.44,0,5.81-2.28,11.65-4.95,17.52-8.01,15.24-7.96,29.66-17.24,43.26-27.84,14.3-11.08,27.46-23.45,39.49-37.09,9.31-10.69,17.81-22.04,25.51-34.07,3.88-6.19,7.33-12.64,10.36-19.36ZM308.61,271.6c-3.98,5.5-8.08,10.76-12.31,15.77-2.22,2.63-4.23,4.5-6.16,6.91-2.23,2.8-5.56,5.91-8.35,8.79-12.31,12.08-25.59,23.01-39.83,32.81-2.41,1.66-6.34,4.27-11.79,7.82-9.15,5.49-18.62,10.93-28.25,15.31-1.48.67-2.64.68-4.05,0-7.84-3.72-15.45-7.8-22.81-12.25-16.31-9.84-31.48-21.13-45.53-33.85-2.51-2.28-5.03-4.52-7.54-6.73-9.03-8.96-15.6-16.05-19.71-21.28-3.29-4.18-6.55-8.36-9.77-12.54-.83-1.37-3-3.74-2.15-5.35.22-.41.84-.91,1.88-1.53,27.22-16.12,46.42-27.46,57.59-34,2.62-1.53,4.39-2.6,5.32-3.23.21-.13.33-.37.33-.62v-12.2c0-.08-.05-.16-.12-.2-.12-.06-.26-.02-.32.09-.14.29-.4.54-.77.76-5.46,3.11-28.29,16.38-68.5,39.81-1.03.6-2.07.88-3.11.83-.25-.01-.48-.16-.59-.38-2.05-3.9-3.86-7.43-5.44-10.61-1.61-3.24-3.18-7.74-4.87-11.55-2.32-6.91-4.91-14.12-6.66-20.8-1.42-5.39-2.92-10.62-3.89-16.27-.4-2.29-.79-4.59-1.17-6.91l-1.87-16.64c-1.69-15.33-2.67-25.16-2.94-29.47-.29-4.69-.4-9.63-.33-14.8,0-.34.22-.65.54-.77l12.76-4.87,11-4.59,35.74-15.77c2.58-1.15,5.12-2.31,7.63-3.5,18.17-8.61,33.95-16.2,47.34-22.79,10.48-5.16,20.13-10.08,28.95-14.76.56-.3,1.24-.3,1.8,0,16.51,8.75,35.12,18.14,55.82,28.17,1.94.94,3.87,1.89,5.78,2.85,6.63,3.33,13.26,6.46,19.91,9.41,16.16,7.67,32.53,14.69,49.11,21.05,4.56,1.75,9.13,3.48,13.71,5.22,0,7.63-.32,15.15-.93,22.57-.68,8.1-1.17,16.28-2.39,24.32l-1.22,13.32c-.43,1.7-.7,3.42-.82,5.15-.13,1.82-.27,3.09-.42,3.8-2.53,12.28-6.3,24.98-11.17,38.38-1.11,3.04-3.14,7.61-6.09,13.69l-2.95,5.69c-.32.61-.94,1-1.62,1.02-1.41.03-2.68-.27-3.8-.91-19.66-11.18-39.54-22.8-59.64-34.87-2.61-1.57-4.94-3.09-7.83-4.17-.03-.01-.06-.02-.09-.02-.15,0-.27.12-.27.27v3.95s-.15,7.44-.15,7.44c0,.23.11.45.31.57,20.75,12.83,41.84,24.94,62.81,37.59.96.58,1.47,1.32,1.52,2.2-.47.93-1.02,1.82-1.62,2.66Z",
  "M233.22,295.61c-.46-.51-.72-1.18-.73-1.87l-.22-12.33-.21-11.01-.2-17,.1-21.25-.06-3.27.2-8.39.43-30.57-.09-5.21-.21-8.5.2-31.18v-9.23s.13-15.27.13-15.27l-.17-9.99.05-14.43c0-.19-.13-.36-.32-.4l-31.41-7.62c-.6-.15-1.24.04-1.67.5-3.14,3.39-6.19,6.27-9.16,8.64-12.41,9.89-24.82,18.44-37.23,25.63-6.37,3.7-12.79,6.58-19.24,8.65l-.08,8.66-.02,9.81.11,20.27s0,.05.02.07c.04.08.14.12.23.08l35.11-16.43.15,8.72.13,31.75-.07,8.61-.04,7.03.21,27.32.17,9.27.18,25.06-.12,15.22c0,2.64.36,7.2-1.6,9.26-1.33,1.4-2.66,2.82-3.99,4.26l-11.05,12.14s-.05.06-.07.1c-.2.32-.1.74.22.94l45.78,28.65c.56.35,1.26.35,1.82.01l47.84-28.72s.07-.04.1-.07c.26-.24.28-.64.04-.91l-15.28-17.01Z",
]

type Viewport = {
  width: number
  height: number
}

export function LogoPreloader() {
  const reactId = useId().replace(/:/g, "")
  const clipId = `one-fill-clip-${reactId}`
  const maskId = `one-reveal-mask-${reactId}`

  const rootRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const revealSvgRef = useRef<SVGSVGElement>(null)
  const fillRectRef = useRef<SVGRectElement>(null)
  const maskLogoRef = useRef<SVGGElement>(null)
  const solidRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Animation | null>(null)
  const [viewport, setViewport] = useState<Viewport>({ width: 1, height: 1 })
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    const root = rootRef.current
    const mark = markRef.current
    const revealSvg = revealSvgRef.current
    const solid = solidRef.current
    const fillRect = fillRectRef.current
    const maskLogo = maskLogoRef.current

    if (!root || !mark || !revealSvg || !solid || !fillRect || !maskLogo) {
      return
    }

    const measuredViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    setViewport(measuredViewport)

    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", updateViewport)

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const getLogoWidth = () =>
      measuredViewport.width <= 760
        ? Math.min(measuredViewport.width * 0.46, 150)
        : Math.min(measuredViewport.width * 0.44, 190)

    const setMaskTransform = (scale = 1) => {
      const logoWidth = getLogoWidth()
      const logoHeight = logoWidth * (VIEW_BOX_HEIGHT / VIEW_BOX_WIDTH)
      const x = measuredViewport.width / 2 - logoWidth / 2
      const y = measuredViewport.height / 2 - logoHeight / 2
      const baseScale = logoWidth / VIEW_BOX_WIDTH
      const originX = x + logoWidth / 2
      const originY = y + logoHeight / 2

      maskLogo.setAttribute(
        "transform",
        `translate(${originX} ${originY}) scale(${baseScale * scale}) translate(${-VIEW_BOX_WIDTH / 2} ${-VIEW_BOX_HEIGHT / 2})`,
      )
    }
    const getLogoOpacity = (progress: number, fadeEndProgress: number) => {
      if (progress <= 0) {
        return 1
      }

      if (progress >= fadeEndProgress) {
        return 0
      }

      return 1 - progress / fadeEndProgress
    }
    setMaskTransform(1)

    if (reduceMotion) {
      gsap.set(fillRect, { attr: { y: 0, height: VIEW_BOX_HEIGHT } })
      animationRef.current = gsap.to(root, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.2,
        onComplete: () => setIsMounted(false),
      })

      return () => {
        window.removeEventListener("resize", updateViewport)
        animationRef.current?.kill()
      }
    }

    const logoWidth = getLogoWidth()
    const logoHeight = logoWidth * (VIEW_BOX_HEIGHT / VIEW_BOX_WIDTH)
    const finalScale =
      (Math.hypot(measuredViewport.width, measuredViewport.height) /
        Math.max(Math.min(logoWidth, logoHeight), 1)) *
      MASK_OVERSHOOT_FACTOR
    const logoScreenFillScale = finalScale / MASK_OVERSHOOT_FACTOR
    const scaleEase = gsap.parseEase(SCALE_EASE)
    const logoFadeEndProgress = (() => {
      const targetEaseProgress = Math.min(
        Math.max((logoScreenFillScale - 1) / Math.max(finalScale - 1, 1), 0),
        1,
      )
      let low = 0
      let high = 1

      for (let i = 0; i < 20; i += 1) {
        const mid = (low + high) / 2

        if (scaleEase(mid) < targetEaseProgress) {
          low = mid
        } else {
          high = mid
        }
      }

      return high
    })()

    gsap.set(fillRect, { attr: { y: VIEW_BOX_HEIGHT, height: 0 } })
    gsap.set(revealSvg, { opacity: 0 })
    gsap.set(root, { opacity: 1, pointerEvents: "auto" })
    gsap.set(mark, { opacity: 1, scale: 1, transformOrigin: "50% 50%" })

    const timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => setIsMounted(false),
    })
    animationRef.current = timeline

    timeline
      .to(fillRect, {
        attr: { y: 0, height: VIEW_BOX_HEIGHT },
        duration: 3,
        ease: "power2.inOut",
      })
      .to({}, { duration: 0.2 })
      .set(revealSvg, { opacity: 1 })
      .set(solid, { opacity: 0 })
      .set(mark, { opacity: 1, visibility: "visible", pointerEvents: "none" })
      .to(
        { scale: 1 },
        {
          scale: finalScale,
          duration: SCALE_DURATION,
          ease: SCALE_EASE,
          onUpdate() {
            const currentScale = this.targets()[0].scale
            const linearProgress = this.progress()

            setMaskTransform(currentScale)
            gsap.set(mark, {
              opacity: getLogoOpacity(linearProgress, logoFadeEndProgress),
              scale: currentScale,
            })
          },
        },
      )
      .set(mark, { opacity: 0, visibility: "hidden" })
      .to(root, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        pointerEvents: "none",
      }, "<0.56")

    return () => {
      window.removeEventListener("resize", updateViewport)
      animationRef.current?.kill()
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="logo-preloader" ref={rootRef} aria-hidden="true">
      <div className="logo-preloader__solid" ref={solidRef}>
        <Grainient {...GRAINIENT_PROPS} className="logo-preloader__grainient" />
      </div>

      <svg
        className="logo-preloader__reveal"
        ref={revealSvgRef}
        width={viewport.width}
        height={viewport.height}
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect width={viewport.width} height={viewport.height} fill="white" />
            <g ref={maskLogoRef} fill="black" fillRule="nonzero">
              {SHIELD_PATHS.map((path) => (
                <path key={`mask-${path.slice(0, 28)}`} d={path} />
              ))}
            </g>
          </mask>
        </defs>
        <foreignObject width={viewport.width} height={viewport.height} mask={`url(#${maskId})`}>
          <div className="logo-preloader__grainient-foreign">
            <Grainient {...GRAINIENT_PROPS} className="logo-preloader__grainient" />
          </div>
        </foreignObject>
      </svg>

      <div className="logo-preloader__mark" ref={markRef}>
        <svg
          viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
          role="img"
          aria-label="ONE shield logo"
        >
          <defs>
            {/* Paths are extracted from public/ONE_SHIELD.svg so the loader uses the final shield geometry. */}
            <clipPath id={clipId}>
              <rect ref={fillRectRef} x="0" y={VIEW_BOX_HEIGHT} width={VIEW_BOX_WIDTH} height="0" />
            </clipPath>
          </defs>
          <g className="logo-preloader__fill" clipPath={`url(#${clipId})`}>
            {SHIELD_PATHS.map((path) => (
              <path key={`fill-${path.slice(0, 28)}`} d={path} />
            ))}
          </g>
          <g className="logo-preloader__stroke">
            {SHIELD_PATHS.map((path) => (
              <path key={`stroke-${path.slice(0, 28)}`} d={path} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
