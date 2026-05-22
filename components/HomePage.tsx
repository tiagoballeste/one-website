"use client"

import { useCallback, useState } from "react"
import { ForWhomSection } from "@/components/ForWhomSection"
import { Hero } from "@/components/Hero"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { LogoPreloader } from "@/components/LogoPreloader"
import { PositioningSection } from "@/components/PositioningSection"
import { RegistrationModal } from "@/components/RegistrationModal"
import { SiteHeader } from "@/components/SiteHeader"
import { SmoothScroll } from "@/components/SmoothScroll"

export function HomePage() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)

  const openRegistration = useCallback(() => {
    setIsRegistrationOpen(true)
  }, [])

  const closeRegistration = useCallback(() => {
    setIsRegistrationOpen(false)
  }, [])

  return (
    <>
      <SmoothScroll />
      <LogoPreloader />
      <SiteHeader onOpenRegistration={openRegistration} />
      <main>
        <Hero onOpenRegistration={openRegistration} />
        <PositioningSection />
        <ForWhomSection />
        <HowItWorksSection />
      </main>
      <RegistrationModal isOpen={isRegistrationOpen} onClose={closeRegistration} />
    </>
  )
}
