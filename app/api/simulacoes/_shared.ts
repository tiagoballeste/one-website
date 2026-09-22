import { NextResponse } from "next/server"
import {
  MAX_RENT_AMOUNT,
  calculateSimulation,
  hasAtLeastTwoNames,
  normalizeName,
  normalizeWhatsapp,
  type SimulationPayload,
} from "@/lib/simulation"

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000"

export function resolveSimulationEndpoint(path = "") {
  const rawBase = process.env.ONE_BACKEND_URL || DEFAULT_BACKEND_URL
  const base = rawBase.replace(/\/+$/, "")
  const suffix = path ? `/${path.replace(/^\/+/, "")}` : ""

  if (/\/v1\/publico\/simulacoes$/.test(base)) return `${base}${suffix}`
  if (/\/v1\/publico$/.test(base)) return `${base}/simulacoes${suffix}`
  if (/\/v1$/.test(base)) return `${base}/publico/simulacoes${suffix}`
  return `${base}/v1/publico/simulacoes${suffix}`
}

export function validateSimulationPayload(value: unknown): value is SimulationPayload {
  if (!value || typeof value !== "object") return false
  const payload = value as Partial<SimulationPayload>
  const monetaryFields: Array<keyof SimulationPayload> = [
    "rentAmount",
    "estimatedMonthlyInsurance",
    "estimatedYearlyInsurance",
    "cashTotal",
    "fiveInstallmentValue",
    "fiveInstallmentTotal",
    "twelveInstallmentValue",
    "twelveInstallmentTotal",
  ]

  return (
    typeof payload.fullName === "string" &&
    hasAtLeastTwoNames(payload.fullName) &&
    payload.fullName.length <= 120 &&
    typeof payload.whatsapp === "string" &&
    /^\d{10,11}$/.test(payload.whatsapp) &&
    payload.source === "website_simulation" &&
    payload.contactStatus === "awaiting_contact" &&
    typeof payload.simulatedAt === "string" &&
    monetaryFields.every((field) => typeof payload[field] === "number" && Number.isFinite(payload[field])) &&
    typeof payload.rentAmount === "number" &&
    payload.rentAmount > 0 &&
    payload.rentAmount <= MAX_RENT_AMOUNT
  )
}

export function normalizeSimulationPayload(payload: SimulationPayload): SimulationPayload {
  return {
    ...payload,
    ...calculateSimulation(payload.rentAmount),
    fullName: normalizeName(payload.fullName),
    whatsapp: normalizeWhatsapp(payload.whatsapp),
    source: "website_simulation",
    contactStatus: "awaiting_contact",
    simulatedAt: new Date().toISOString(),
  }
}

export async function forwardSimulationRequest({
  method,
  path,
  payload,
  developmentId,
}: {
  method: "POST" | "PATCH"
  path?: string
  payload: unknown
  developmentId?: string
}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(resolveSimulationEndpoint(path), {
      method,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    })
    const contentType = response.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : { message: await response.text().catch(() => "") }

    if (process.env.NODE_ENV !== "production" && [404, 405].includes(response.status)) {
      return developmentSimulationResponse(developmentId)
    }
    return NextResponse.json(body, { status: response.status })
  } catch (error) {
    if (process.env.NODE_ENV !== "production") return developmentSimulationResponse(developmentId)
    const isTimeout = error instanceof DOMException && error.name === "AbortError"
    return NextResponse.json(
      {
        message: isTimeout
          ? "A simulação demorou mais que o esperado. Tente novamente."
          : "Não foi possível registrar a simulação agora. Tente novamente em instantes.",
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}

function developmentSimulationResponse(id?: string) {
  return NextResponse.json(
    {
      id: id || `local-${crypto.randomUUID()}`,
      persistence: "development_mock",
    },
    { status: id ? 200 : 201 },
  )
}
