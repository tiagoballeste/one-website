"use client"

import { useRef, useState } from "react"
import { RegistrationModal } from "./RegistrationModal"

export function Hero() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const registrationButtonRef = useRef<HTMLButtonElement | null>(null)

  const closeRegistration = () => {
    setIsRegistrationOpen(false)
    requestAnimationFrame(() => registrationButtonRef.current?.focus())
  }

  return (
    <>
      <section className="hero" aria-label="ONE Fiança Locatícia">
        <video
          className="hero__video"
          src="/media/background-one-site-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />

        <div className="hero__content">
          <h1>
            <span>Fiança Locatícia</span>
            <span>
              rápida e <strong>sem burocracia</strong>
            </span>
          </h1>

          <p className="hero__copy">
            A ONE Fiança Locatícia oferece uma solução prática para substituir o fiador tradicional e
            reduzir a necessidade de caução, ajudando você a avançar no contrato de aluguel com mais
            tranquilidade.
          </p>

          <div className="hero__actions" aria-label="Ações principais">
            <button
              ref={registrationButtonRef}
              className="button button--primary"
              type="button"
              onClick={() => setIsRegistrationOpen(true)}
            >
              Cadastrar minha imobiliária
            </button>
            <button className="button button--secondary" type="button">
              Sou corretor
            </button>
          </div>
        </div>
      </section>

      <button className="whatsapp-float" type="button" aria-label="Abrir WhatsApp">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16.02 3.2c-7.02 0-12.73 5.67-12.73 12.65 0 2.23.59 4.42 1.72 6.35L3.2 28.8l6.8-1.78a12.82 12.82 0 0 0 6.02 1.51c7.02 0 12.73-5.68 12.73-12.66 0-6.99-5.71-12.67-12.73-12.67Zm0 22.96a10.4 10.4 0 0 1-5.32-1.45l-.38-.23-4.04 1.06 1.08-3.92-.25-.4a10.16 10.16 0 0 1-1.58-5.37c0-5.67 4.71-10.29 10.5-10.29 5.78 0 10.48 4.62 10.48 10.3 0 5.68-4.7 10.3-10.49 10.3Zm5.75-7.7c-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.72.16-.21.31-.82 1.02-1.01 1.23-.18.21-.37.24-.68.08-.31-.15-1.32-.48-2.51-1.54a9.4 9.4 0 0 1-1.73-2.14c-.18-.32-.02-.49.14-.65.14-.14.31-.37.47-.55.15-.18.2-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.72-1.72-.98-2.36-.26-.61-.52-.53-.72-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.62s1.13 3.04 1.29 3.25c.16.21 2.23 3.38 5.4 4.74.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.86-.76 2.13-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </button>

      <RegistrationModal isOpen={isRegistrationOpen} onClose={closeRegistration} />
    </>
  )
}
