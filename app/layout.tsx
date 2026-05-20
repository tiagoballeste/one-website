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
