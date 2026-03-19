import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {

	const { search } : { search: string } = await request.json();

	const result = await prisma.$queryRawUnsafe(`
		SELECT *,
			ts_rank(search_vector, plainto_tsquery('simple', unaccent($1))) AS rank,
			similarity(name, $1) AS similarity_score
		FROM "Folder"
		WHERE
			-- Full-text match
			search_vector @@ plainto_tsquery('simple', unaccent($1))

			-- OR fuzzy match (typo tolerance)
			OR name % $1

			-- OR autocomplete (prefix)
			OR name ILIKE $1 || '%'

		ORDER BY
			rank DESC,
			similarity_score DESC
		LIMIT 20;
	`, search);
}