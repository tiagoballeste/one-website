"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

type HeroProps = {
  isReady: boolean
  onOpenRegistration: () => void
}

export function Hero({ isReady, onOpenRegistration }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const revealItems = gsap.utils.toArray<HTMLElement>(".hero-reveal", hero)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduceMotion) {
      gsap.set(revealItems, { opacity: 1, y: 0 })
      return
    }

    if (!isReady) {
      gsap.set(revealItems, { opacity: 0, y: 32 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.to(revealItems, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.12,
      })

      gsap.to(".hero-more__chevron", {
        y: 7,
        opacity: 1,
        duration: 0.95,
        ease: "power1.inOut",
        stagger: 0.14,
        repeat: -1,
        yoyo: true,
      })
    }, hero)

    return () => ctx.revert()
  }, [isReady])

  const scrollToNextSection = () => {
    document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      <section ref={heroRef} className="hero" id="inicio" aria-label="ONE Fiança Locatícia">
        <video
          className="hero__video"
          src="/media/one-background-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        <div className="hero__content">
          <h1 className="hero-reveal">
            <span>Fiança Locatícia</span>
            <span>
              rápida e <strong>sem burocracia</strong>
            </span>
          </h1>

          <p className="hero__copy hero-reveal">
            Alternativa moderna ao fiador tradicional e à caução. Avance no contrato de aluguel com
            mais agilidade.
          </p>

          <div className="hero__actions hero-reveal" aria-label="Ações principais">
            <button className="button button--primary" type="button" onClick={onOpenRegistration}>
              Cadastrar minha imobiliária
            </button>
            <button className="button button--secondary" type="button">
              Sou corretor
            </button>
          </div>
        </div>

        <button className="hero-more hero-reveal" type="button" onClick={scrollToNextSection}>
          <span>Saiba mais</span>
          <span className="hero-more__chevrons" aria-hidden="true">
            <svg className="hero-more__chevron" viewBox="0 0 24 24">
              <path d="M12 15.4 5.3 8.7l1.4-1.4 5.3 5.3 5.3-5.3 1.4 1.4L12 15.4Z" />
            </svg>
            <svg className="hero-more__chevron" viewBox="0 0 24 24">
              <path d="M12 15.4 5.3 8.7l1.4-1.4 5.3 5.3 5.3-5.3 1.4 1.4L12 15.4Z" />
            </svg>
          </span>
        </button>
      </section>

      <a
        className="whatsapp-float"
        href="https://wa.me/5511970309686"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a ONE pelo WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16.02 3.2c-7.02 0-12.73 5.67-12.73 12.65 0 2.23.59 4.42 1.72 6.35L3.2 28.8l6.8-1.78a12.82 12.82 0 0 0 6.02 1.51c7.02 0 12.73-5.68 12.73-12.66 0-6.99-5.71-12.67-12.73-12.67Zm0 22.96a10.4 10.4 0 0 1-5.32-1.45l-.38-.23-4.04 1.06 1.08-3.92-.25-.4a10.16 10.16 0 0 1-1.58-5.37c0-5.67 4.71-10.29 10.5-10.29 5.78 0 10.48 4.62 10.48 10.3 0 5.68-4.7 10.3-10.49 10.3Zm5.75-7.7c-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.72.16-.21.31-.82 1.02-1.01 1.23-.18.21-.37.24-.68.08-.31-.15-1.32-.48-2.51-1.54a9.4 9.4 0 0 1-1.73-2.14c-.18-.32-.02-.49.14-.65.14-.14.31-.37.47-.55.15-.18.2-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.72-1.72-.98-2.36-.26-.61-.52-.53-.72-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.62s1.13 3.04 1.29 3.25c.16.21 2.23 3.38 5.4 4.74.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.86-.76 2.13-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </a>
    </>
  )
}
