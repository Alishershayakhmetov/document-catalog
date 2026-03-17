import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type FilterBody = {
  mallId?: string | null;
  catalogId?: string | null;
  subcatalogId?: string | null;
  documentationId?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FilterBody;

    const mallId = body.mallId ?? null;
    const catalogId = body.catalogId ?? null;
    const subcatalogId = body.subcatalogId ?? null;
    const documentationId = body.documentationId ?? null;

    const where = buildFolderFilter({
      mallId,
      catalogId,
      subcatalogId,
      documentationId,
    });

    const folders = await prisma.folder.findMany({
      where,
      include: {
        files: true,
        mall: true,
        catalog: true,
        subcatalog: true,
        documentation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ folders }, { status: 200 });
  } catch (error) {
    console.error("Filter folders error:", error);
    return NextResponse.json(
      { error: "Failed to filter folders" },
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