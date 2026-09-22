"use client"

import { MouseEvent, useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"
import { buildOneWhatsAppUrl } from "@/lib/one-contact"

gsap.registerPlugin(ScrollTrigger)

type FinalCTASectionProps = {
  onOpenRegistration: () => void
}

const whatsappUrl = buildOneWhatsAppUrl()

function FinalIcon({ name }: { name: "arrow" | "instagram" | "facebook" }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.15 8.34h2.16V4.78A27.1 27.1 0 0 0 13.16 4c-3.12 0-5.26 1.91-5.26 5.39v3.02H4.37v3.99H7.9V24h4.27v-7.6h3.34l.63-3.99h-3.97V9.78c0-1.15.31-1.44 1.98-1.44Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "arrow" ? (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      ) : null}
      {name === "instagram" ? (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="4.25" />
          <circle cx="12" cy="12" r="3.3" />
          <path d="M16.5 7.65h.01" />
        </>
      ) : null}
    </svg>
  )
}

function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
  const target = document.querySelector(href)

  if (!target) {
    return
  }

  event.preventDefault()
  target.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function FinalCTASection({ onOpenRegistration }: FinalCTASectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) {
      return
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        ".final-reveal",
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
          },
        },
      )
    }, sectionRef)

    return () => context.revert()
  }, [shouldReduceMotion])

  return (
    <section ref={sectionRef} className="final-section" id="contato" aria-labelledby="final-cta-title">
      <div className="final-section__inner">
        <div className="final-cta" aria-describedby="final-cta-copy">
          <span className="final-cta__pill final-reveal">Comece em poucos minutos</span>
          <h2 id="final-cta-title" className="final-cta__headline final-reveal">
            <span>Pronto para alugar com</span>
            <span>
              mais <strong>segurança?</strong>
            </span>
          </h2>
          <p id="final-cta-copy" className="final-cta__copy final-reveal">
            Avaliação em até 15 minutos. Atendimento humano. Atuação nacional.
          </p>

          <div className="final-cta__actions final-reveal">
            <button type="button" className="final-cta__button final-cta__button--primary" onClick={onOpenRegistration}>
              <span>Quero ser parceiro</span>
              <FinalIcon name="arrow" />
            </button>
            <a
              className="final-cta__button final-cta__button--secondary"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>Falar no Whatsapp</span>
              <WhatsappIcon />
            </a>
          </div>

          <p className="final-cta__disclaimer final-reveal">
            A avaliação está sujeita à análise cadastral, documentação e condições comerciais vigentes.
          </p>
        </div>

        <div className="final-section__divider final-reveal" aria-hidden="true" />

        <footer className="site-footer final-reveal" aria-label="Rodapé">
          <div className="site-footer__brand">
            <a className="site-footer__logo" href="#inicio" onClick={(event) => handleAnchorClick(event, "#inicio")}>
              <img src="/logos/logo-one-colored.svg" alt="ONE Fiança Locatícia" loading="lazy" />
            </a>
            <p>Solução de garantia para tornar o aluguel mais simples, rápido e seguro.</p>

            <div className="site-footer__socials" aria-label="Redes sociais">
              <a className="site-footer__social-link" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <WhatsappIcon />
              </a>
              <a
                className="site-footer__social-link"
                href="https://www.instagram.com/onefianca.locaticia/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FinalIcon name="instagram" />
              </a>
              <a
                className="site-footer__social-link"
                href="https://www.facebook.com/people/One-fian%C3%A7a-locat%C3%ADcia/61588526420243/#"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FinalIcon name="facebook" />
              </a>
            </div>
          </div>

          <nav className="site-footer__nav" aria-label="Navegação do rodapé">
            <h3 className="site-footer__column-title">NAVEGAÇÃO</h3>
            <div className="site-footer__nav-list">
              <a href="#produtos" onClick={(event) => handleAnchorClick(event, "#produtos")}>
                Soluções
              </a>
              <a href="#como-funciona" onClick={(event) => handleAnchorClick(event, "#como-funciona")}>
                Como Funciona
              </a>
              <a href="#coberturas" onClick={(event) => handleAnchorClick(event, "#coberturas")}>
                Cobertura
              </a>
              <button type="button" onClick={onOpenRegistration}>
                Para parceiros
              </button>
            </div>
          </nav>

          <address className="site-footer__contact">
            <h3 className="site-footer__column-title">CONTATO</h3>
            <a className="site-footer__email" href="mailto:ceo@onefiancalocaticia.com.br">
              ceo@onefiancalocaticia.com.br
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              11 97030-9686
            </a>
          </address>
        </footer>

        <div className="site-footer__bottom final-reveal">
          <p>© 2026 ONE Fiança Locatícia. Todos os direitos reservados.</p>
        </div>
      </div>
    </section>
  )
}
