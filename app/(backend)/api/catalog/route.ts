import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "..", "uploads");

export async function GET() {
  const mall = await prisma.mall.findMany({
    select: {
      name: true,
      id: true,
    },

    orderBy: {
      updatedAt: "desc"
    },
  });

  const catalog = await prisma.catalog.findMany({
    select: {
      name: true,
      id: true,
			mallId: true,
    },
    orderBy: {
      updatedAt: "desc"
    },
  });

  const subCatalog = await prisma.subcatalog.findMany({
    select: {
      name: true,
      id: true,
			catalogId: true,
    },
    orderBy: {
      updatedAt: "desc"
    },
  });
	
  const documentation = await prisma.documentation.findMany({
    select: {
      name: true,
      id: true,
			subcatalogId: true
    },
    orderBy: {
      updatedAt: "desc"
    },
  });

  return NextResponse.json({mall, catalog, subCatalog, documentation});
}

export async function POST(request: Request) {
  try {
    const { categoryType, createCategoryName, parentCategoryId } = await request.json();

		console.log(categoryType, createCategoryName, parentCategoryId)

		const normalizedType = categoryType.toLowerCase().trim();

    if (!normalizedType || !createCategoryName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
		let createdCategory;

    switch (categoryType) {
      case "mall":
        createdCategory = await prisma.mall.create({
          data: { name: createCategoryName },
        });
        break;

      case "category":
        createdCategory = await prisma.catalog.create({
          data: { name: createCategoryName, mallId: parentCategoryId },
        });
        break;

      case "subcategory":
        createdCategory = await prisma.subcatalog.create({
          data: { name: createCategoryName, catalogId: parentCategoryId },
        });
        break;
			
			case "documentation":
        createdCategory = await prisma.documentation.create({
          data: { name: createCategoryName, subcatalogId: parentCategoryId },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid category type" },
          { status: 400 }
        );
    }

    return NextResponse.json(createdCategory,
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

type CategoryType = "mall" | "documentation" | "catalog" | "subcatalog";

function getCategoryModel(categoryType: CategoryType) {
  switch (categoryType) {
    case "mall":
      return prisma.mall;
    case "documentation":
      return prisma.documentation;
    case "catalog":
      return prisma.catalog;
    case "subcatalog":
      return prisma.subcatalog;
    default:
      return null;
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
    const { categoryType, categoryId, name } = await request.json();

    if (!categoryType || !categoryId || !name) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (!isValidCategoryType(categoryType)) {
      return NextResponse.json(
        { error: "Invalid categoryType" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    let updatedCategory;

    switch (categoryType) {
      case "mall":
        updatedCategory = await prisma.mall.update({
          where: { id: categoryId },
          data: { name },
        });
        break;

      case "documentation":
        updatedCategory = await prisma.documentation.update({
          where: { id: categoryId },
          data: { name },
        });
        break;

      case "catalog":
        updatedCategory = await prisma.catalog.update({
          where: { id: categoryId },
          data: { name },
        });
        break;

      case "subcatalog":
        updatedCategory = await prisma.subcatalog.update({
          where: { id: categoryId },
          data: { name },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid category type" },
          { status: 400 }
        );
    }

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
    const { categoryType, categoryId } = await request.json();

    if (!categoryType || !categoryId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (!isValidCategoryType(categoryType)) {
      return NextResponse.json(
        { error: "Invalid categoryType" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    let deletedCategory;
    let isUsed;
    let isUsedByCatalog;
    let isUsedBySubcatalog;
    let isUsedByDocumentation;

    switch (categoryType) {
      case "mall":
        isUsed = await prisma.folder.findFirst({
          where: { mallId: categoryId },
        });

        isUsedByCatalog = await prisma.catalog.findFirst({
          where: { mallId: categoryId }
        })

        if (isUsed || isUsedByCatalog) {
          return NextResponse.json(
            { error: "Category is used in folders or in catalogs" },
            { status: 409 }
          );
        }

        deletedCategory = await prisma.mall.delete({
          where: { id: categoryId },
        });
        break;

      case "catalog":
        isUsed = await prisma.folder.findFirst({
          where: { catalogId: categoryId },
        });

        isUsedBySubcatalog = await prisma.subcatalog.findFirst({
          where: { catalogId: categoryId }
        })

        if (isUsed || isUsedBySubcatalog) {
          return NextResponse.json(
            { error: "Category is used in folders or in subcatalogs" },
            { status: 400 }
          );
        }

        deletedCategory = await prisma.catalog.delete({
          where: { id: categoryId },
        });
        break;

      case "subcatalog":
        isUsed = await prisma.folder.findFirst({
          where: { subcatalogId: categoryId },
        });

        isUsedByDocumentation = await prisma.documentation.findFirst({
          where: { subcatalogId: categoryId }
        })

        if (isUsed || isUsedByDocumentation) {
          return NextResponse.json(
            { error: "Category is used in folders or in documentation" },
            { status: 400 }
          );
        }

        deletedCategory = await prisma.subcatalog.delete({
          where: { id: categoryId },
        });
        break;

      case "documentation":
        isUsed = await prisma.folder.findFirst({
          where: { documentationId: categoryId },
        });

        if (isUsed) {
          return NextResponse.json(
            { error: "Category is used in folders" },
            { status: 400 }
          );
        }

        deletedCategory = await prisma.documentation.delete({
          where: { id: categoryId },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid category type" },
          { status: 400 }
        );
    }

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