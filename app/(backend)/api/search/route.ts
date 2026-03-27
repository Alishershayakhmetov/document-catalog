import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { search }: { search: string } = await request.json();

  if (!search?.trim()) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const results = await prisma.$queryRawUnsafe(`
    SELECT
      f.id              AS file_id,
      f."mimeType",
      f."fileSize",
      f.description,
      f."systemName",
      f."uploadedAt",

      -- Parent folder
      fo.id             AS folder_id,
      fo.name           AS folder_name,
      fo.date           AS folder_date,

      -- Ranking signals
      ts_rank(
        to_tsvector('simple', unaccent(COALESCE(f."systemName", '')) || ' ' || unaccent(COALESCE(f.description, ''))),
        plainto_tsquery('simple', unaccent($1))
      ) AS rank,

      GREATEST(
        similarity(f."systemName", $1),
        similarity(COALESCE(f.description, ''), $1)
      ) AS similarity_score

    FROM "File" f
    JOIN "Folder" fo ON fo.id = f."folderId"

    WHERE
      -- Full-text match across filename + description
      to_tsvector('simple', unaccent(COALESCE(f."systemName", '')) || ' ' || unaccent(COALESCE(f.description, '')))
        @@ plainto_tsquery('simple', unaccent($1))

      -- Fuzzy match on filename
      OR f."systemName" % $1

      -- Fuzzy match on description
      OR COALESCE(f.description, '') % $1

      -- Prefix/autocomplete on filename
      OR f."systemName" ILIKE $1 || '%'

    ORDER BY
      rank DESC,
      similarity_score DESC

    LIMIT 20;
  `, search);

  return NextResponse.json({ results }, { status: 200 });
}