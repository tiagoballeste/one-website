import type { SimulationPayload, SimulationPersistenceResponse } from "@/lib/simulation"

type PersistenceBody = {
  id?: string | number
  simulationId?: string | number
  simulation_id?: string | number
  leadId?: string | number
  lead_id?: string | number
  persistence?: SimulationPersistenceResponse["persistence"]
  message?: string
}

async function parseResponse(response: Response) {
  const body = (await response.json().catch(() => ({}))) as PersistenceBody
  if (!response.ok) {
    throw new Error(body.message || "Não foi possível registrar a simulação agora.")
  }
  return body
}

export async function persistSimulation(payload: SimulationPayload, simulationId?: string) {
  const response = await fetch(simulationId ? `/api/simulacoes/${encodeURIComponent(simulationId)}` : "/api/simulacoes", {
    method: simulationId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const body = await parseResponse(response)
  const id = body.id ?? body.simulationId ?? body.simulation_id ?? body.leadId ?? body.lead_id ?? simulationId
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("A simulação foi recebida, mas não retornou um identificador.")
  }
  return { id: String(id), persistence: body.persistence } satisfies SimulationPersistenceResponse
}

export function trackSimulationWhatsappOpen(simulationId: string) {
  void fetch(`/api/simulacoes/${encodeURIComponent(simulationId)}/whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ openedAt: new Date().toISOString() }),
    keepalive: true,
  }).catch(() => undefined)
}
