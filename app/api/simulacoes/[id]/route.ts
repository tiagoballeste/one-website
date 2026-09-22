import { NextRequest, NextResponse } from "next/server"
import { forwardSimulationRequest, normalizeSimulationPayload, validateSimulationPayload } from "../_shared"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const payload = await request.json().catch(() => null)
  if (!id || !validateSimulationPayload(payload)) {
    return NextResponse.json({ message: "Dados da simulação inválidos." }, { status: 400 })
  }
  return forwardSimulationRequest({
    method: "PATCH",
    path: encodeURIComponent(id),
    payload: normalizeSimulationPayload(payload),
    developmentId: id,
  })
}
