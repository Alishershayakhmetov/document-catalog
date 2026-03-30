import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { CategoryType } from "@/shared/types/global";
import { createId } from '@paralleldrive/cuid2';

export async function GET() {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      id: true,
      path: true,
      parent: true,
      children: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  })

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const { createCategoryName, parentCategoryId } = await request.json();

    if (!createCategoryName) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }
    if (parentCategoryId) {
      const parentCategory = await prisma.category.findFirst({
        where: {
          id: parentCategoryId
        }, 
        select: {
          path: true
        }
      })
      if (!parentCategory) {
        return NextResponse.json(
          { error: "Parent not found" },
          { status: 404 }
        );
      }

      const id = createId();

      const path = parentCategory.path
        ? `${parentCategory.path}/${id}`
        : `/${id}`;

      const createdCategory = await prisma.category.create({
        data: {
          id: id,
          name: createCategoryName,
          parentId: parentCategoryId,
          path: path
        }
      })

      return NextResponse.json(createdCategory, { status: 201 });
    } else {
      const id = createId();

      const path = `/${id}`;

      const createdCategory = await prisma.category.create({
        data: {
          id: id,
          name: createCategoryName,
          parentId: parentCategoryId,
          path: path
        }
      })
      
      return NextResponse.json(createdCategory, { status: 201 });
    }
    
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

function isValidCategoryType(value: unknown): value is CategoryType {
  return (
    value === "mall" ||
    value === "documentation" ||
    value === "catalog" ||
    value === "subcatalog"
  );
}

export async function PATCH(request: Request) {
  try {
    const { categoryId, newName } = await request.json();

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    if (!newName || typeof newName !== "string" || !newName.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name: newName }
    })

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { categoryId } = await request.json();

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    const isUsed = await prisma.folder.findFirst({
      where: { categoryId: categoryId }
    })
    
    const isUsedByCategory = await prisma.category.findFirst({
      where: { parentId: categoryId }
    })

    if (isUsed || isUsedByCategory) {
      return NextResponse.json(
        { error: "Category is used by folders or in catalogs" },
        { status: 409 }
      );
    }

    const deletedCategory = await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json(deletedCategory);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}