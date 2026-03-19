import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const { folderId, fileIds } = await request.json();
  console.log(folderId, fileIds)

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
    
    const deletedFile = await prisma.file.deleteMany({
      where: {
        id: { in: fileIds },
        folderId
      }
    });

    return NextResponse.json(deletedFile);
  } catch (error: any) {
    // generic server error
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}