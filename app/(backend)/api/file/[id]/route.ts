import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

	const file = await prisma.file.findUnique({
    where: { id },
  });

  if (!file) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(file);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const deletedFile = await prisma.file.delete({
      where: { id },
    });

    return NextResponse.json(deletedFile);
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
  { params }: { params: { id: string } }
) {
  const { id } = params;

  let body: Partial<{
    date: string;
    systemName: string;
    physicalLocation: string;
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
  const allowedKeys = ["date", "systemName", "physicalLocation"];
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
    const updatedFile = await prisma.file.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedFile);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}