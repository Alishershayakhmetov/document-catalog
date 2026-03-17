export type Option = {
  id: string;
  name: string;
};
export type CatalogOption = Option & {
  mallId: string;
};
export type SubcatalogOption = Option & {
  catalogId: string;
};
export type DocumentationOption = Option & {
  subcatalogId: string;
};