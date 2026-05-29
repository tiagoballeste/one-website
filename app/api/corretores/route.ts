import { NextRequest, NextResponse } from "next/server"

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000"

const resolveEndpoint = () => {
  const rawBase = process.env.ONE_BACKEND_URL || process.env.NEXT_PUBLIC_ONE_BACKEND_URL || DEFAULT_BACKEND_URL
  const base = rawBase.replace(/\/+$/, "")

  if (/\/v1\/publico\/corretores$/.test(base)) return base
  if (/\/v1\/publico$/.test(base)) return `${base}/corretores`
  if (/\/v1$/.test(base)) return `${base}/publico/corretores`

  return `${base}/v1/publico/corretores`
}

export async function POST(request: NextRequest) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const payload = await request.json()
    const response = await fetch(resolveEndpoint(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    })

    const contentType = response.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : { message: await response.text().catch(() => "") }

    return NextResponse.json(body, { status: response.status })
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "AbortError"

    return NextResponse.json(
      {
        message: isTimeout
          ? "Tempo esgotado ao conectar com o backend de cadastros."
          : "Não foi possível conectar ao backend de cadastros. Verifique se a API está online.",
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
