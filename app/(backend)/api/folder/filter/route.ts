import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoryIds: string[] = body.categoryIds || [];

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { path: true, name: true, id: true }
    });

    // Build subtree filters
    const pathFilters = categories.map(cat => ({
      path: { startsWith: cat.path }
    }));

    // Fetch folders
    const folders = await prisma.folder.findMany({
      where: {
        category: {
          OR: pathFilters.length ? pathFilters : undefined
        }
      },
      include: {
        files: true,
        category: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Collect all category IDs
    const allCategoryIds = new Set<string>();
    folders.forEach(folder => {
      folder.category.path.split("/").forEach(id => {
        if (id) allCategoryIds.add(id);
      });
    });

    // Fetch all categories
    const allCategories = await prisma.category.findMany({
      where: { id: { in: Array.from(allCategoryIds) } },
      select: { id: true, name: true }
    });

    const categoryMap = new Map(
      allCategories.map(c => [c.id, c])
    );

    // Build result
    const result = folders.map(folder => {
      const ids = folder.category.path.split("/").filter(Boolean);

      const fullPath = ids
        .map(id => categoryMap.get(id)?.name)
        .filter(Boolean)
        .join(" / ");

      return {
        id: folder.id,
        name: folder.name,
        date: folder.date,
        fileCount: folder.files.length,
        fullPath,

        // category for the folder
        category: {
          id: folder.category.id,
          name: folder.category.name
        },

        // full hierarchy
        path: ids.map(id => ({
          id,
          name: categoryMap.get(id)?.name
        })),
      };
    });
    return NextResponse.json({ folders: result }, { status: 200 });
  } catch (error) {
    console.error("Filter folders error:", error);
    return NextResponse.json(
      { error: "Failed to filter folders" },
      { status: 500 }
    );
  }
}