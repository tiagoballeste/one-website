import { NextResponse } from "next/server"
import { forwardSimulationRequest } from "../../_shared"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ message: "Simulação não encontrada." }, { status: 400 })

  return forwardSimulationRequest({
    method: "POST",
    path: `${encodeURIComponent(id)}/whatsapp`,
    payload: { contactStatus: "whatsapp_opened", openedAt: new Date().toISOString() },
    developmentId: id,
  })
}
