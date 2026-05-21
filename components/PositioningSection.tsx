"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion, useReducedMotion } from "motion/react"
import { BorderTrail } from "@/components/core/border-trail"
import { InView } from "@/components/core/in-view"
import SplitText from "./SplitText"

gsap.registerPlugin(ScrollTrigger)

const positioningCards = [
  {
    title: "Sem fiador tradicional",
    description: "Substitua o fiador tradicional, conforme análise da proposta.",
    icon: "/icons/positioning/fiador.svg",
  },
  {
    title: "Menos barreiras com caução",
    description: "Evite desembolsos elevados quando a fiança for aceita na negociação.",
    icon: "/icons/positioning/caucao.svg",
  },
  {
    title: "Avaliação em até 15 minutos",
    description: "Análise inicial rápida, sujeita à documentação e condições vigentes.",
    icon: "/icons/positioning/15-minutos.svg",
  },
  {
    title: "Atendimento humano",
    description: "Tecnologia com suporte humano sempre que precisar de orientação.",
    icon: "/icons/positioning/atendimento.svg",
  },
  {
    title: "Atuação nacional",
    description: "Atendimento para clientes e parceiros em todo o Brasil.",
    icon: "/icons/positioning/atuacao-nacional.svg",
  },
  {
    title: "Mais segurança",
    description: "Cobertura dos compromissos garantidos conforme as condições contratadas.",
    icon: "/icons/positioning/seguranca.svg",
  },
]

const cardsGroupVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const reducedMotionCardVariants = {
  hidden: {
    opacity: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
}

export function PositioningSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()
  const [useMobileCardScrollTrigger, setUseMobileCardScrollTrigger] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)")
    const updateMobileState = () => setUseMobileCardScrollTrigger(query.matches)

    updateMobileState()
    query.addEventListener("change", updateMobileState)

    return () => query.removeEventListener("change", updateMobileState)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".positioning-section__inner",
          { y: 86 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 42%",
              scrub: true,
            },
          },
        )
      })

      return () => mm.revert()
    }, section)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !useMobileCardScrollTrigger) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add("(max-width: 760px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".positioning-card-motion")

        cards.forEach((card) => {
          gsap.set(card, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          })

          gsap.fromTo(
            card,
            {
              autoAlpha: 0,
              y: 40,
              scale: 0.96,
              filter: "blur(8px)",
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 60%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )
        })

        requestAnimationFrame(() => ScrollTrigger.refresh())

        return () => {
          gsap.set(cards, {
            clearProps: "opacity,visibility,transform,filter",
          })
        }
      })

      mm.add("(max-width: 760px) and (prefers-reduced-motion: reduce)", () => {
        gsap.set(".positioning-card-motion", {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        })
      })

      return () => mm.revert()
    }, section)

    return () => ctx.revert()
  }, [useMobileCardScrollTrigger])

  return (
    <section ref={sectionRef} className="positioning-section" id="sobre" aria-label="Fiança locatícia ONE">
      <div className="positioning-section__inner">
        <div className="positioning-section__intro">
          <h2
            className="positioning-section__headline"
            aria-label="A fiança locatícia que facilita sua jornada de aluguel"
          >
            <SplitText
              text="A fiança locatícia que"
              tag="span"
              splitType="words"
              delay={80}
              duration={0.8}
              ease="power3.out"
              from={{ opacity: 0, y: 34 }}
              to={{ opacity: 1, y: 0 }}
              rootMargin="-100px"
              textAlign="center"
              className="positioning-section__headline-line"
            />
            <SplitText
              text="facilita sua jornada de aluguel"
              tag="span"
              splitType="words"
              delay={80}
              duration={0.8}
              ease="power3.out"
              from={{ opacity: 0, y: 34 }}
              to={{ opacity: 1, y: 0 }}
              rootMargin="-100px"
              textAlign="center"
              className="positioning-section__gradient-line positioning-section__split-gradient"
            />
          </h2>

          <SplitText
            text="Encontrar um fiador ou imobilizar dinheiro com caução pode tornar o aluguel mais difícil, lento e burocrático. A ONE nasceu para simplificar esse processo, oferecendo uma alternativa moderna e segura para viabilizar contratos de locação com mais agilidade."
            tag="p"
            splitType="lines"
            delay={120}
            duration={0.9}
            ease="power3.out"
            from={{ opacity: 0, y: 28 }}
            to={{ opacity: 1, y: 0 }}
            rootMargin="-100px"
            textAlign="center"
            className="positioning-section__copy"
          />
        </div>

        {useMobileCardScrollTrigger ? (
          <div className="positioning-section__cards">
            {positioningCards.map((card) => (
              <div className="positioning-card-motion" key={card.title}>
                <article className="positioning-card">
                  <BorderTrail
                    className="positioning-card__border-trail"
                    size={80}
                    style={{
                      boxShadow: "0px 0px 36px 14px rgb(201 205 230 / 22%), 0 0 70px 28px rgb(27 77 254 / 14%)",
                    }}
                  />
                  <img className="positioning-card__icon" src={card.icon} alt="" aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              </div>
            ))}
          </div>
        ) : (
          <InView
            className="positioning-section__cards"
            viewOptions={{ once: true, margin: "0px 0px -250px 0px" }}
            variants={cardsGroupVariants}
          >
            {positioningCards.map((card) => (
              <motion.div
                className="positioning-card-motion"
                variants={reduceMotion ? reducedMotionCardVariants : cardVariants}
                key={card.title}
              >
                <article className="positioning-card">
                  <img className="positioning-card__icon" src={card.icon} alt="" aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              </motion.div>
            ))}
          </InView>
        )}
      </div>
    </section>
  )
}
