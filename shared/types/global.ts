export type CategoryType = "mall" | "documentation" | "catalog" | "subcatalog";

export type SelectedFileItem = {
  file: File;
  physicalLocation: string;
  name: string;
  description: string | null;
  date: string;
};

export type FileCardInfo = {
  id: string,
  date: string | null,
  systemName: string | null,
  physicalLocation: string | null,
  description: string | null,
}

export type FileCardInfoState = {
  date: string | null,
  systemName: string | null,
  physicalLocation: string | null,
  description: string | null,
}