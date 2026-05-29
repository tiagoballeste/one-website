import { NextRequest, NextResponse } from "next/server"

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000"

const resolveEndpoint = () => {
  const rawBase = process.env.ONE_BACKEND_URL || process.env.NEXT_PUBLIC_ONE_BACKEND_URL || DEFAULT_BACKEND_URL
  const base = rawBase.replace(/\/+$/, "")

  if (/\/v1\/publico\/imobiliarias\/buscar$/.test(base)) return base
  if (/\/v1\/publico\/imobiliarias$/.test(base)) return `${base}/buscar`
  if (/\/v1\/publico$/.test(base)) return `${base}/imobiliarias/buscar`
  if (/\/v1$/.test(base)) return `${base}/publico/imobiliarias/buscar`

  return `${base}/v1/publico/imobiliarias/buscar`
}

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q") ?? ""
    const limit = searchParams.get("limit") ?? "10"
    const endpoint = new URL(resolveEndpoint())

    endpoint.searchParams.set("q", q)
    endpoint.searchParams.set("limit", limit)

    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
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
        results: [],
        message: isTimeout ? "Tempo esgotado ao buscar imobiliárias." : "Não foi possível buscar imobiliárias agora.",
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
