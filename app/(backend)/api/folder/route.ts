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
    const search = searchParams.get("search");

    if (!search) {
      // filter only, no search
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
          _count: {
            select: {
              files: true
            }
          },
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

      const parsedFolders = folders.map(folder => {
        return {id: folder.id, name: folder.name, date: folder.date, fileCount: folder._count.files}
      })

      return NextResponse.json({ folders: parsedFolders});
    }
    else {
      // filter and search
      const { sql: filterSQL, values } = buildSQLFilter({
        mallId,
        catalogId,
        subcatalogId,
        documentationId,
      });

      // prepare tsquery
      const tsQuery = search
        .trim()
        .split(/\s+/)
        .map(word => `${word}:*`)
        .join(" & ");

      const result = await prisma.$queryRawUnsafe(`
        SELECT 
          id, 
          name, 
          date, 
          "updatedAt", -- Added because you use it in ORDER BY
          (SELECT COUNT(*) FROM "File" WHERE "File"."folderId" = "Folder".id)::integer AS "fileCount",
          ts_rank(search_vector, to_tsquery('simple', $${values.length + 1})) AS rank,
          similarity(name, $${values.length + 2}) AS sim
        FROM "Folder"
        WHERE
          (${filterSQL})

          AND (
            search_vector @@ to_tsquery('simple', $${values.length + 1})
            OR name ILIKE $${values.length + 2} || '%'
            OR name % $${values.length + 2}
          )

        ORDER BY
          (name ILIKE $${values.length + 2} || '%') DESC,
          rank DESC,
          sim DESC,
          "updatedAt" DESC

        LIMIT 20
      `, ...values, tsQuery, search);

      return NextResponse.json({ folders: result });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

function buildSQLFilter({
  mallId,
  catalogId,
  subcatalogId,
  documentationId,
}: any) {
  const conditions: string[] = [];
  const values: any[] = [];

  if (mallId) {
    values.push(mallId);
    conditions.push(`"mallId" = $${values.length}`);
  }

  if (catalogId) {
    values.push(catalogId);
    conditions.push(`"catalogId" = $${values.length}`);
  }

  if (subcatalogId) {
    values.push(subcatalogId);
    conditions.push(`"subcatalogId" = $${values.length}`);
  }

  if (documentationId) {
    values.push(documentationId);
    conditions.push(`"documentationId" = $${values.length}`);
  }

  return {
    sql: conditions.length ? conditions.join(" AND ") : "TRUE",
    values,
  };
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
    const shoppingMall = formData.get("shoppingMallId") as string | null;
    const documentation = formData.get("documentationId") as string | null;
    const catalog = formData.get("catalogId") as string | null;
    const subCatalog = formData.get("subcatalogId") as string | null;

    if (!folderName || !folderDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { files, filesMetadata } = parseFilesFormData(formData);

    if ((documentation && !subCatalog) || (subCatalog && !catalog) || (catalog && !shoppingMall))     
      return NextResponse.json(
      { error: "Category Ids conflict" },
      { status: 409 }
    );

    const folder = await createFolder({
      folderName,
      folderDate,
      shoppingMallId: shoppingMall,
      catalogId: catalog,
      subCatalogId: subCatalog,
      documentationId: documentation,
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