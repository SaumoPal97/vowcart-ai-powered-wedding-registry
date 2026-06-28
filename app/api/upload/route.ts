import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { getCoupleForRequest } from "@/lib/repos/couples"

// Allow a little headroom for a cold Aurora start when resolving the couple.
export const maxDuration = 30

// POST /api/upload — issues a short-lived client-upload token so the browser
// uploads the cover photo directly to Vercel Blob (no 4.5 MB serverless limit).
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Uploads aren't configured. Paste an image URL instead." },
      { status: 501 },
    )
  }

  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only an active registry owner (the request's couple) may upload.
        const couple = await getCoupleForRequest()
        if (!couple) throw new Error("Not authorized to upload.")
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ coupleId: couple.id }),
        }
      },
      // The browser stores the returned URL via the registry save, so this
      // callback is intentionally a no-op (and is skipped on localhost).
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (err) {
    console.error("[v0] POST /api/upload error:", err)
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed." },
      { status: 400 },
    )
  }
}
