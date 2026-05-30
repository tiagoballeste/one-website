"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const partners = [
  {
    id: "sunset",
    name: "Sunset Incorporadora",
    logo: "/logos/partners/sunset.svg",
  },
  {
    id: "acif",
    name: "ACIF Associação Empresarial de Florianópolis",
    logo: "/logos/partners/acif.svg",
  },
  {
    id: "vertical-urbana",
    name: "Vertical Urbana",
    logo: "/logos/partners/vertical-urbana.svg",
  },
  {
    id: "creci",
    name: "CRECI",
    logo: "/logos/partners/creci.svg",
  },
  {
    id: "leve-investimentos",
    name: "Leve Investimentos",
    logo: "/logos/partners/leve-investimentos.svg",
  },
]

const carouselLogos = [...partners, ...partners]

export function TrustSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reducedMotion) return

    const context = gsap.context(() => {
      gsap.fromTo(
        ".trust-reveal",
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: "top 76%",
            once: true,
          },
        },
      )
    }, section)

    return () => context.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="trust-section" id="confianca" aria-labelledby="trust-title">
      <div className="trust-section__inner">
        <div className="trust-section__intro">
          <h2 id="trust-title" className="trust-section__headline trust-reveal">
            <span>Parceiros que fortalecem</span>
            <span>
              a operação da <strong>ONE</strong>
            </span>
          </h2>
          <p className="trust-section__copy trust-reveal">
            Relacionamentos estratégicos que ampliam credibilidade, alcance e presença no mercado de locação.
          </p>
        </div>

        <div className="trust-carousel trust-reveal" aria-label="Parceiros institucionais da ONE">
          <div className="trust-carousel__viewport">
            <div className="trust-carousel__track">
              {carouselLogos.map((partner, index) => (
                <article
                  className="trust-carousel__card"
                  data-partner={partner.id}
                  key={`${partner.name}-${index}`}
                  aria-hidden={index >= partners.length}
                >
                  <span className="trust-carousel__logo-frame">
                    <img src={partner.logo} alt={index < partners.length ? partner.name : ""} />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
