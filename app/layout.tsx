import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ONE - Fiança Locatícia",
  description: "Fiança locatícia moderna para contratos de aluguel com mais agilidade.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('scrollRestoration' in history){history.scrollRestoration='manual'}window.scrollTo(0,0);",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
