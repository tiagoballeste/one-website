"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type PointerEvent } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const carouselImages = [
  {
    src: "/media/for-whom/escritorio.png",
    alt: "Equipe imobiliária reunida em escritório",
  },
  {
    src: "/media/for-whom/comercial-abrindo-negocio.png",
    alt: "Profissionais em frente a imóvel comercial",
  },
  {
    src: "/media/for-whom/logistico-industrial.png",
    alt: "Profissionais em operação logística",
  },
  {
    src: "/media/for-whom/residencial-familia-em-casa.png",
    alt: "Família em casa analisando informações de locação",
  },
]

const audienceItems = [
  {
    title: "Inquilinos",
    description: "Alugue sem fiador ou caução, conforme análise da proposta.",
    icon: "/icons/for-whom/inquilinos.svg",
  },
  {
    title: "Proprietários",
    description: "Mais proteção para quem coloca seu imóvel para alugar.",
    icon: "/icons/for-whom/proprietarios.svg",
  },
  {
    title: "Imobiliárias e corretores",
    description: "Mais contratos fechados, menos burocracia na operação.",
    icon: "/icons/for-whom/imobiliarias-corretores.svg",
  },
  {
    title: "Empresas e operações logísticas",
    description: "Mais agilidade para imóveis comerciais, empresariais e logísticos.",
    icon: "/icons/for-whom/empresas-logisticas.svg",
  },
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.7 5.3 20.4 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.6l-4.3-4.3 1.4-1.4Z" />
    </svg>
  )
}

export function ForWhomSection() {
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const pointerStartX = useRef<number | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [direction, setDirection] = useState(1)

  const goToImage = (nextIndex: number, nextDirection: number) => {
    setDirection(nextDirection)
    setActiveImage((nextIndex + carouselImages.length) % carouselImages.length)
  }

  const showNextImage = () => goToImage(activeImage + 1, 1)
  const showPreviousImage = () => goToImage(activeImage - 1, -1)

  useEffect(() => {
    if (reduceMotion) return

    const interval = window.setInterval(() => {
      setDirection(1)
      setActiveImage((current) => (current + 1) % carouselImages.length)
    }, 3000)

    return () => window.clearInterval(interval)
  }, [reduceMotion])

  useEffect(() => {
    const section = sectionRef.current
    const carousel = carouselRef.current
    const content = contentRef.current

    if (!section || !carousel || !content) return

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>(".for-whom-reveal-block")

      if (reduceMotion) {
        gsap.set(blocks, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
        })
        return
      }

      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          {
            autoAlpha: 0,
            y: 32,
            filter: "blur(6px)",
          },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
              end: "top 65%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      const mm = gsap.matchMedia()

      mm.add("(min-width: 761px)", () => {
        const getPinDistance = () => Math.max(0, content.offsetHeight - carousel.offsetHeight)

        if (getPinDistance() < 80) return

        ScrollTrigger.create({
          trigger: carousel,
          start: "top top+=88",
          end: () => `+=${getPinDistance()}`,
          pin: carousel,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })

        const refresh = () => ScrollTrigger.refresh()
        const images = Array.from(section.querySelectorAll("img"))

        images.forEach((image) => {
          if (!image.complete) {
            image.addEventListener("load", refresh, { once: true })
          }
        })

        requestAnimationFrame(refresh)

        return () => {
          images.forEach((image) => image.removeEventListener("load", refresh))
        }
      })

      return () => mm.revert()
    }, section)

    return () => ctx.revert()
  }, [reduceMotion])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return

    const distance = event.clientX - pointerStartX.current
    pointerStartX.current = null

    if (Math.abs(distance) < 48) return
    if (distance > 0) {
      showPreviousImage()
    } else {
      showNextImage()
    }
  }

  const scrollToHowItWorks = () => {
    const target = document.querySelector("#como-funciona")
    if (target) {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    }
  }

  return (
    <section ref={sectionRef} className="for-whom-section" id="para-quem" aria-label="Para quem é a fiança locatícia ONE">
      <div className="for-whom-section__inner">
        <div ref={carouselRef} className="for-whom-carousel">
          <div
            className="for-whom-carousel__viewport"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerStartX.current = null
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={carouselImages[activeImage].src}
                src={carouselImages[activeImage].src}
                alt={carouselImages[activeImage].alt}
                draggable={false}
                custom={direction}
                initial={reduceMotion ? false : { opacity: 0, x: direction * 34, scale: 1.015 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: direction * -34, scale: 0.992 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>

            <button
              className="for-whom-carousel__button for-whom-carousel__button--previous"
              type="button"
              aria-label="Imagem anterior"
              onClick={showPreviousImage}
            >
              <ArrowIcon />
            </button>
            <button
              className="for-whom-carousel__button for-whom-carousel__button--next"
              type="button"
              aria-label="Próxima imagem"
              onClick={showNextImage}
            >
              <ArrowIcon />
            </button>
          </div>
        </div>

        <div ref={contentRef} className="for-whom-section__content">
          <span className="for-whom-section__tag for-whom-reveal-block">Para quem é?</span>

          <h2 className="for-whom-section__headline for-whom-reveal-block">
            <span>Uma solução para</span>
            <span>todos os lados da locação</span>
          </h2>

          <p className="for-whom-section__copy for-whom-reveal-block">
            A ONE Fiança Locatícia atende diferentes perfis do mercado imobiliário, criando uma ponte mais segura e
            eficiente entre quem quer alugar, quem administra o imóvel, quem é proprietário e quem precisa viabilizar
            espaços comerciais, empresariais ou logísticos.
          </p>

          <div className="for-whom-audience">
            {audienceItems.map((item) => (
              <article className="for-whom-audience__item for-whom-reveal-block" key={item.title}>
                <img src={item.icon} alt="" aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="for-whom-benefit for-whom-reveal-block">
            <div className="for-whom-benefit__icon" aria-hidden="true">
              <img src="/icons/for-whom/menos-burocracia.svg" alt="" />
            </div>
            <div className="for-whom-benefit__content">
              <h3>Menos burocracia, mais contratos fechados</h3>
              <ul>
                <li>
                  <img src="/icons/for-whom/check.svg" alt="" aria-hidden="true" />
                  Reduz barreira no fechamento
                </li>
                <li>
                  <img src="/icons/for-whom/check.svg" alt="" aria-hidden="true" />
                  Melhora a experiência do cliente
                </li>
                <li>
                  <img src="/icons/for-whom/check.svg" alt="" aria-hidden="true" />
                  Acelera o giro de carteira das locações
                </li>
              </ul>
            </div>
          </div>

          <div className="for-whom-section__actions for-whom-reveal-block">
            <a
              className="for-whom-cta for-whom-cta--primary"
              href="https://wa.me/5511970309686"
              target="_blank"
              rel="noreferrer"
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
