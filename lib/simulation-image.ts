import { normalizeName } from "@/lib/simulation"

type SimulationImageDownload = {
  element: HTMLElement
  fullName: string
  generatedAt?: Date
}

function canvasToBlob(canvas: HTMLCanvasElement, type: "image/jpeg" | "image/png", quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Não foi possível gerar a imagem da simulação."))
    }, type, quality)
  })
}

function normalizeFileName(value: string) {
  return (
    normalizeName(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cliente"
  )
}

function formatDateForFile(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"))
  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>((resolve, reject) => {
        image.addEventListener("load", () => resolve(), { once: true })
        image.addEventListener("error", () => reject(new Error("Não foi possível carregar a identidade visual da simulação.")), { once: true })
      })
    }),
  )
}

export async function downloadSimulationImage({ element, fullName, generatedAt = new Date() }: SimulationImageDownload) {
  if (document.fonts?.ready) await document.fonts.ready
  await waitForImages(element)

  const { default: html2canvas } = await import("html2canvas")
  const canvas = await html2canvas(element, {
    width: 1080,
    height: 1350,
    windowWidth: 1080,
    windowHeight: 1350,
    scale: 1,
    backgroundColor: "#071333",
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
  })

  const [jpeg, png] = await Promise.all([
    canvasToBlob(canvas, "image/jpeg", 0.92),
    canvasToBlob(canvas, "image/png"),
  ])
  const output = jpeg.size <= png.size ? { blob: jpeg, extension: "jpg" } : { blob: png, extension: "png" }
  const fileName = `simulacao-one-fianca-${normalizeFileName(fullName)}-${formatDateForFile(generatedAt)}.${output.extension}`
  const url = URL.createObjectURL(output.blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
