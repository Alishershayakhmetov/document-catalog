import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  parseFilesFormData,
  saveFilesToFolder,
} from "@/lib/server/file-upload.service";
import { promises as fs } from "fs";

export const UPLOAD_DIR = process.env.UPLOAD_DIR!;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch the folder and its specific category path
  const folder = await prisma.folder.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      date: true,
      files: {
        select: {
          id: true,
          date: true,
          systemName: true,
          physicalLocation: true,
          description: true,
          mimeType: true
        },
        orderBy: {
          updatedAt: "desc"
        }
      },
      category: {
        select: {
          path: true,
        }
      }
    }
  });

  if (!folder || !folder.category) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const pathIds = folder.category.path.split('/').filter(Boolean);

  // Fetch all category names involved in that path
  const categories = await prisma.category.findMany({
    where: {
      id: { in: pathIds }
    },
    select: {
      id: true,
      name: true
    }
  });

  // Map the IDs back to names in the correct order
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const pathNames = pathIds.map(id => categoryMap.get(id) || "Unknown");

  return NextResponse.json({
    ...folder,
    categoryPathNames: pathNames
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: { files: true },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ message: "Folder not found" }, { status: 404 });
    }

    // If files exist, block the deletion
    if (folder._count.files > 0) {
      return NextResponse.json(
        { message: "Cannot delete folder: It still contains files." },
        { status: 409 }
      );
    }

    await prisma.folder.delete({
      where: { id },
    });
    await fs.rmdir(UPLOAD_DIR + "/" + folder.id)

    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error: any) {
    // record doesn't exist
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    // generic server error
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: Partial<{
    date: string;
    name: string;
    categoryId: string;
  }>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // allowed keys
  const allowedKeys = ["date", "name", "categoryId"];
  const updateData: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (body[key as keyof typeof body] !== undefined) {
      updateData[key] = body[key as keyof typeof body];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { message: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    console.log(updateData)
    console.log(id)

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        date: new Date(updateData.date),
        name: updateData.name,
        categoryId: updateData.categoryId
      }
    })

    return NextResponse.json(updatedFolder);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (error.code === "P2003" && !body.categoryId) {
      return NextResponse.json({ message: "category not provided" }, { status: 404 });
    }
    console.log(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{id: string}>}) {
  try {
    const { id } = await params;

    const folder = await prisma.folder.findUnique({
      where: { id: id },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const { files, filesMetadata } = parseFilesFormData(formData);
    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const createdFiles = await saveFilesToFolder({
      folderId: id,
      files,
      filesMetadata,
    });

    return NextResponse.json(
      {
        message: "Files uploaded successfully",
        files: createdFiles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}