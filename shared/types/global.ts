export type CategoryType = {
  id: string;
  name: string;
  parentId: string | null;
}

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
  physicalLocation: string | null | undefined,
  description: string | null,
  mimeType?: string | null | undefined
}

export type FileCardInfoState = {
  date: string | null,
  systemName: string | null,
  physicalLocation: string | null | undefined,
  description: string | null,
}