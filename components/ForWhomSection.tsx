"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "motion/react"

gsap.registerPlugin(ScrollTrigger)

const personaCards = [
  {
    title: "Inquilinos",
    subtitle: "Alugue sem fiador",
    image: "/images/for-whom-cards/inquilinos.png",
  },
  {
    title: "Proprietários",
    subtitle: "Receba sempre em dia",
    image: "/images/for-whom-cards/proprietarios.png",
  },
  {
    title: "Imobiliárias e corretores",
    subtitle: "Feche mais contratos",
    image: "/images/for-whom-cards/imobiliarias-corretores.png",
  },
  {
    title: "Empresas e operações logísticas",
    subtitle: "Garantia para grandes operações",
    image: "/images/for-whom-cards/empresas-operacoes-logisticas.png",
  },
]

const benefitBullets = [
  "Reduz barreira no fechamento",
  "Melhora a experiência do cliente",
  "Acelera o giro de carteira das locações",
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.7 5.3 20.4 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.6l-4.3-4.3 1.4-1.4Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m8.3 13.4-3-3 1.2-1.2 1.8 1.8 5.2-5.2 1.2 1.2-6.4 6.4Z" />
    </svg>
  )
}

export function ForWhomSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const revealBlocks = gsap.utils.toArray<HTMLElement>(".for-whom-reveal")
      const cards = gsap.utils.toArray<HTMLElement>(".for-whom-card")

      if (reduceMotion) {
        gsap.set([...revealBlocks, ...cards], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        })
        return
      }

      revealBlocks.forEach((block) => {
        gsap.fromTo(
          block,
          {
            autoAlpha: 0,
            y: 32,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            autoAlpha: 0,
            scale: 0.8,
            filter: "blur(10px)",
          },
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.62,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      requestAnimationFrame(() => ScrollTrigger.refresh())
    }, section)

    return () => ctx.revert()
  }, [reduceMotion])

  const scrollToHowItWorks = () => {
    const target = document.querySelector("#como-funciona")
    if (target) {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    }
  }

  return (
    <section ref={sectionRef} className="for-whom-section" id="para-quem" aria-label="Para quem é a fiança locatícia ONE">
      <div className="for-whom-section__inner">
        <header className="for-whom-section__intro">
          <span className="for-whom-section__pill for-whom-reveal">Para quem é?</span>
          <h2 className="for-whom-section__headline for-whom-reveal">
            <span>Uma solução para</span>
            <span>
              <strong>todos os lados</strong> da locação
            </span>
          </h2>
          <p className="for-whom-section__copy for-whom-reveal">
            A ONE Fiança Locatícia atende diferentes perfis do mercado imobiliário, criando uma ponte mais segura e
            eficiente entre quem quer alugar, quem administra o imóvel, quem é proprietário e quem precisa viabilizar
            espaços comerciais, empresariais ou logísticos.
          </p>
        </header>

        <div className="for-whom-cards" aria-label="Perfis atendidos pela ONE">
          {personaCards.map((card) => (
            <article className="for-whom-card" key={card.title}>
              <img className="for-whom-card__image" src={card.image} alt="" aria-hidden="true" loading="lazy" />
              <div className="for-whom-card__content">
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="for-whom-section__footer">
          <div className="for-whom-benefit for-whom-reveal">
            <h3>Menos burocracia, mais contratos fechados</h3>
            <ul>
              {benefitBullets.map((bullet) => (
                <li key={bullet}>
                  <span className="for-whom-benefit__check">
                    <CheckIcon />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="for-whom-section__actions for-whom-reveal">
            <a
              className="for-whom-cta for-whom-cta--primary"
              href="https://wa.me/5511970309686"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale com um especialista
              <ArrowIcon />
            </a>
            <button className="for-whom-cta for-whom-cta--secondary" type="button" onClick={scrollToHowItWorks}>
              Como funciona a fiança locatícia?
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
