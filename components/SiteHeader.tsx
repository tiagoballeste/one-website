"use client"

import { MouseEvent, useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

type SiteHeaderProps = {
  onOpenRegistration: () => void
}

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Produtos", href: "#produtos" },
]

export function SiteHeader({ onOpenRegistration }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let ticking = false

    const updateScrolledState = () => {
      setIsScrolled(window.scrollY > 28)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrolledState)
        ticking = true
      }
    }

    updateScrolledState()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) {
      return
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const items = menu.querySelectorAll("[data-menu-item]")

    if (isMenuOpen) {
      gsap.set(menu, { pointerEvents: "auto" })
      gsap.to(menu, {
        autoAlpha: 1,
        y: 0,
        duration: reduceMotion ? 0 : 0.32,
        ease: "power3.out",
      })
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0 : 0.28,
          ease: "power3.out",
          stagger: reduceMotion ? 0 : 0.045,
        },
      )
      return
    }

    gsap.to(menu, {
      autoAlpha: 0,
      y: -8,
      duration: reduceMotion ? 0 : 0.22,
      ease: "power2.out",
      onComplete: () => gsap.set(menu, { pointerEvents: "none" }),
    })
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isMenuOpen])

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "#inicio") {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    setIsMenuOpen(false)
  }

  const handleOpenRegistration = () => {
    setIsMenuOpen(false)
    onOpenRegistration()
  }

  return (
    <header className={`site-header ${isScrolled ? "is-scrolled" : ""} ${isMenuOpen ? "is-menu-open" : ""}`}>
      <div className="site-header__shell">
        <a className="site-header__brand" href="#inicio" aria-label="ONE Fiança Locatícia" onClick={(event) => handleAnchorClick(event, "#inicio")}>
          <img src="/logos/logo-one-wide.svg" alt="ONE Fiança Locatícia" />
        </a>

        <span className="site-header__divider" aria-hidden="true" />

        <nav className="site-header__nav" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(event) => handleAnchorClick(event, link.href)}>
              {link.label}
            </a>
          ))}
        </nav>

        <button className="site-header__cta" type="button" onClick={handleOpenRegistration}>
          Quero ser parceiro
        </button>

        <button
          className="site-header__menu-button"
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="site-mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        ref={menuRef}
        className="site-header__mobile-menu"
        id="site-mobile-menu"
        aria-hidden={!isMenuOpen}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-menu-item
            onClick={(event) => handleAnchorClick(event, link.href)}
          >
            {link.label}
          </a>
        ))}
        <button type="button" data-menu-item onClick={handleOpenRegistration}>
          Quero ser parceiro
        </button>
      </div>
    </header>
  )
}
