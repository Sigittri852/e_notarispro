import { mkdir, writeFile } from "fs/promises"
import path from "path"

export const runtime = "nodejs"

/** Folder di drive C: (bisa diubah lewat env PDF_EXPORT_DIR). */
function getExportDir(): string {
  const fromEnv = process.env.PDF_EXPORT_DIR?.trim()
  if (fromEnv) return path.resolve(fromEnv)
  return path.join("C:", "e_notaris_export", "pdf")
}

function sanitizeFilename(name: string): string {
  const base = path.basename(name.replace(/\\/g, "/"))
  if (!base || base.includes("..") || /[/\\]/.test(base)) {
    return `akta-${Date.now()}.pdf`
  }
  const trimmed = base.slice(0, 200)
  return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    const nameField = form.get("filename")

    if (!file || typeof file === "string") {
      return Response.json({ error: "Tidak ada file PDF" }, { status: 400 })
    }

    if (!(file instanceof Blob)) {
      return Response.json({ error: "Format file tidak valid" }, { status: 400 })
    }

    const filename = sanitizeFilename(
      typeof nameField === "string" && nameField ? nameField : "akta.pdf"
    )

    const buf = Buffer.from(await file.arrayBuffer())
    const dir = getExportDir()
    await mkdir(dir, { recursive: true })
    const dest = path.join(dir, filename)
    await writeFile(dest, buf)

    return Response.json({
      ok: true,
      path: dest,
      folder: dir,
      filename,
    })
  } catch (e) {
    console.error("[simpan-pdf]", e)
    return Response.json(
      {
        error:
          "Gagal menyimpan ke disk. Pastikan npm run dev jalan di Windows, drive C: bisa ditulis, atau set PDF_EXPORT_DIR ke folder yang diizinkan.",
      },
      { status: 500 }
    )
  }
}
