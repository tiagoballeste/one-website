import { Hero } from "@/components/Hero"
import { LogoPreloader } from "@/components/LogoPreloader"

export default function Home() {
  return (
    <>
      <LogoPreloader />
      <main>
        <Hero />
      </main>
    </>
  )
}
