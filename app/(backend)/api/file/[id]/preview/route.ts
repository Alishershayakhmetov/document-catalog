import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id: fileId } = await params;

  const file = await prisma.file.findUnique({
    where:   { id: fileId }
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const uploadDir = process.env.UPLOAD_DIR ?? `${process.cwd()}/uploads`;

  return streamFile(`${uploadDir}/${file.folderId}/${file.storedFilename}`, file.mimeType ?? "application/octet-stream", file.systemName);
}

// ── Helper ────────────────────────────────────────────────────────────────────

function streamFile(
  filePath: string,
  contentType: string | null,
  filename: string,
): NextResponse {

  console.log(filePath)

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  const nodeStream = createReadStream(filePath);
  const webStream  = Readable.toWeb(nodeStream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type":        contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control":       "private, max-age=3600",
    },
  });
}
