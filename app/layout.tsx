import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ONE Shield Preloader",
  description: "Premium SVG logo preloader with a masked hero reveal.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
