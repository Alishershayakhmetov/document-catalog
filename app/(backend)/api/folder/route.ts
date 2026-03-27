import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  parseFilesFormData,
  saveFilesToFolder,
} from "@/lib/server/file-upload.service";
/*
export async function GET(request: NextRequest) {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        files: true,
        category: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Fetch all categories
    const allCategories = await prisma.category.findMany({
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
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}
*/

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryIds = searchParams.getAll("categoryIds");
    console.log(categoryIds)
    // Build category filter only when IDs are provided
    let categoryFilter = {};

    if (categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { path: true }
      });

      const paths = categories.map(c => c.path);

      // remove parent paths
      const filteredPaths = paths.filter(p =>
        !paths.some(other => other !== p && other.startsWith(p))
      );

      const pathFilters = filteredPaths.map(path => ({
        path: { startsWith: path }
      }));

      
      console.log("1", categories);

      categoryFilter = {
        category: {
          is: {
            OR: pathFilters
          }
        }
      };

      console.log("2", JSON.stringify(categoryFilter, null, 2));
    }

    const folders = await prisma.folder.findMany({
      where: categoryFilter,
      include: {
        files: true,
        category: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Collect all ancestor category IDs from paths
    const allCategoryIds = new Set<string>();
    folders.forEach(folder => {
      folder.category.path.split("/").filter(Boolean).forEach(id => {
        allCategoryIds.add(id);
      });
    });

    const allCategories = await prisma.category.findMany({
      where: { id: { in: Array.from(allCategoryIds) } },
      select: { id: true, name: true }
    });

    const categoryMap = new Map(allCategories.map(c => [c.id, c]));

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
        category: {
          id: folder.category.id,
          name: folder.category.name
        },
        path: ids.map(id => ({
          id,
          name: categoryMap.get(id)?.name
        })),
      };
    });

    return NextResponse.json({ folders: result }, { status: 200 });

  } catch (error) {
    console.error("Fetch folders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const folderName = formData.get("folderName") as string;
    const folderDate = formData.get("folderDate") as string;
    const categoryIds = formData.getAll("categoryIds") as string[];

    if (!folderName || !folderDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { files, filesMetadata } = parseFilesFormData(formData);

    const currentCategory = await categorySanityCheck(categoryIds);
    if(!currentCategory.success) {
      return NextResponse.json({ error: currentCategory.error }, { status: currentCategory.status });
    }   

    const folder = await prisma.folder.create({
      data: {
        name: folderName,
        date: new Date(folderDate),
        categoryId: currentCategory.data.id
      },
    });

    const createdFiles = await saveFilesToFolder({
      folderId: folder.id,
      files,
      filesMetadata,
    });

    return NextResponse.json(
      {
        folder,
        files: createdFiles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create folder and upload files" },
      { status: 500 }
    );
  }
}

type SanityCheckResult = 
  | { success: true; data: {
      id: string;
      name: string;
      path: string;
      parentId: string | null;
      createdAt: Date;
      updatedAt: Date;
  } } 
  | { success: false; error: string; status: number };

async function categorySanityCheck(categoryIds: string[]): Promise<SanityCheckResult> {
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } }
  });

  // 1. Check all IDs exist
  if (categories.length !== categoryIds.length) {
    return { success: false, error: "Some categories not found", status: 404 };
  }

  // 2. Build map
  const map = new Map(categories.map(c => [c.id, c]));

  // 3. Validate chain
  for (const category of categories) {
    if (category.parentId && !map.has(category.parentId)) {
      return { success: false, error: "Category hierarchy is broken", status: 409 };
    }
  }

  // sort categories by depth (or build chain manually)
  const root = categories.find(c => c.parentId === null);

  if (!root) {
    return { success: false, error: "Missing root category", status: 400 };
  }

  let current = root;

  while (true) {
    const child = categories.find(c => c.parentId === current.id);

    if (!child) break;

    current = child;
  }

  // ensure all categories were used
  if (current.id !== categories[categories.length - 1].id) {
    return { success: false, error: "Invalid category chain", status: 409 };
  }

  return { success: true, data: current };
}