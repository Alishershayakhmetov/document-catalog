import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	const { search } : { search: string } = await request.json();

	const tsQuery = search
		.trim()
		.split(/\s+/)
		.map(word => `${word}:*`)
		.join(" & ");

	const result = await prisma.$queryRawUnsafe(`
		SELECT id, name,
			ts_rank(search_vector, to_tsquery('simple', $1)) AS rank,
			similarity(name, $2) AS sim
		FROM "Folder"
		WHERE
			-- full-text prefix
			search_vector @@ to_tsquery('simple', $1)

			-- OR prefix match
			OR name ILIKE $2 || '%'

			-- OR fuzzy
			OR name % $2

		ORDER BY
			(name ILIKE $2 || '%') DESC,
			rank DESC,
			sim DESC
		LIMIT 10
	`, tsQuery, search); 
}