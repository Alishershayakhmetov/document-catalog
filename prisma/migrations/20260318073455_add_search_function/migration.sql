CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;


ALTER TABLE "Folder"
ADD COLUMN search_vector tsvector;

UPDATE "Folder"
SET search_vector = to_tsvector('simple', name);


CREATE OR REPLACE FUNCTION update_folder_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('simple', unaccent(NEW.name));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER folder_search_trigger
BEFORE INSERT OR UPDATE ON "Folder"
FOR EACH ROW
EXECUTE FUNCTION update_folder_search_vector();


-- Full-text index
CREATE INDEX folder_search_idx
ON "Folder"
USING GIN (search_vector);

-- Trigram index
CREATE INDEX folder_name_trgm_idx
ON "Folder"
USING GIN (name gin_trgm_ops);

-- Name index
CREATE INDEX folder_name_lower_idx
ON "Folder" (LOWER(name));