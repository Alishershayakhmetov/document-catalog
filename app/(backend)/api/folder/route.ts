import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  createFolder,
  parseFilesFormData,
  saveFilesToFolder,
} from "@/lib/server/file-upload.service";

const UPLOAD_DIR = path.join(process.cwd(), "..", "uploads");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const mallId = searchParams.get("mallId");
    const catalogId = searchParams.get("catalogId");
    const subcatalogId = searchParams.get("subcatalogId");
    const documentationId = searchParams.get("documentationId");

    const where = buildFolderFilter({
      mallId,
      catalogId,
      subcatalogId,
      documentationId,
    });

    const folders = await prisma.folder.findMany({
      where,
      select: {
        name: true,
        id: true,
        date: true,
        _count: true,
        // files: true,
        // mall: true,
        // catalog: true,
        // subcatalog: true,
        // documentation: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ folders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

function buildFolderFilter({
  mallId,
  catalogId,
  subcatalogId,
  documentationId,
}: {
  mallId: string | null;
  catalogId: string | null;
  subcatalogId: string | null;
  documentationId: string | null;
}) {
  if (documentationId) {
    return {
      documentationId,
    };
  }

  if (subcatalogId) {
    return {
      OR: [
        { subcatalogId: subcatalogId },
        {
          documentation: {
            subcatalogId,
          },
        },
      ],
    };
  }

  if (catalogId) {
    return {
      OR: [
        { catalogId: catalogId },
        {
          subcatalog: {
            catalogId,
          },
        },
        {
          documentation: {
            subcatalog: {
              catalogId,
            },
          },
        },
      ],
    };
  }

  if (mallId) {
    return {
      OR: [
        { mallId },
        {
          catalog: {
            mallId,
          },
        },
        {
          subcatalog: {
            catalog: {
              mallId,
            },
          },
        },
        {
          documentation: {
            subcatalog: {
              catalog: {
                mallId,
              },
            },
          },
        },
      ],
    };
  }

  return {};
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const folderName = formData.get("folderName") as string;
    const folderDate = formData.get("folderDate") as string;
    const shoppingMall = formData.get("shoppingMall") as string | null;
    const documentation = formData.get("documentation") as string | null;
    const catalog = formData.get("catalogue") as string | null;
    const subCatalog = formData.get("subCatalogue") as string | null;

    if (!folderName || !folderDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { files, filesMetadata } = parseFilesFormData(formData);

    const folder = await createFolder({
      folderName,
      folderDate,
      shoppingMallId: shoppingMall,
      documentationId: documentation,
      catalogId: catalog,
      subCatalogId: subCatalog,
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