import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/server/file-upload.service";

export async function DELETE(request: Request) {
  const { folderId, fileIds } = await request.json();

  try {
    if (typeof folderId !== "string" || folderId.trim() === "") {
      return NextResponse.json(
        { message: "folderId is required" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(fileIds) ||
      fileIds.length === 0 ||
      fileIds.some((id) => typeof id !== "string" || id.trim() === "")
    ) {
      return NextResponse.json(
        { message: "fileIds must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    const files = await prisma.file.findMany({
      where: { id: { in: fileIds }, folderId },
      select: { id: true, storedFilename: true },
    });

    if (files.length === 0) {
      return NextResponse.json(
        { message: "No matching files found" },
        { status: 404 }
      );
    }

    const deleted = await prisma.file.deleteMany({
      where: { id: { in: files.map((f) => f.id) }, folderId },
    });

    const folderDir = path.join(UPLOAD_DIR, folderId);
    const fsResults = await Promise.allSettled(
      files.map((f) =>
        fs.unlink(path.join(folderDir, f.storedFilename))
      )
    );

    fsResults.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(
          `Failed to delete file from disk: ${files[i].storedFilename}`,
          result.reason
        );
      }
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}