import { NextRequest, NextResponse } from "next/server"
import { forwardSimulationRequest, normalizeSimulationPayload, validateSimulationPayload } from "./_shared"

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null)
  if (!validateSimulationPayload(payload)) {
    return NextResponse.json({ message: "Dados da simulação inválidos." }, { status: 400 })
  }
  return forwardSimulationRequest({ method: "POST", payload: normalizeSimulationPayload(payload) })
}
