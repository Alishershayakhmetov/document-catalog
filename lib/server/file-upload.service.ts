import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const UPLOAD_DIR = path.join("..", "uploads");

export type UploadedFileMetadata = {
  physicalLocation?: string | null;
  systemName?: string | null;
	date?: string | null;
};

export async function ensureFolderDirectory(folderId: string) {
  const folderDir = path.join(UPLOAD_DIR, folderId);
  await fs.mkdir(folderDir, { recursive: true });

  return folderDir;
}

export async function saveFilesToFolder(params: {
  folderId: string;
  files: File[];
  filesMetadata: UploadedFileMetadata[];
}) {
  const { folderId, files, filesMetadata } = params;

  if (files.length !== filesMetadata.length) {
    throw new Error("Files metadata mismatch");
  }

  const folderDir = await ensureFolderDirectory(folderId);

  const createdFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const metadata = filesMetadata[i];

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const storedName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(folderDir, storedName);

    await fs.writeFile(filePath, buffer);

    const createdFile = await prisma.file.create({
      data: {
        folderId,
        originalFilename: file.name,
        storedFilename: storedName,
        mimeType: file.type,
        fileSize: file.size,
				date: metadata.date ? new Date(metadata.date) : new Date(),
        systemName: metadata.systemName || file.name,
        physicalLocation: metadata.physicalLocation || null,
      },
    });

    createdFiles.push(createdFile);
  }

  return createdFiles;
}

export async function createFolder(data: {
  folderName: string;
  folderDate: string;
  shoppingMall?: string | null;
  documentation?: string | null;
  catalogue?: string | null;
  subCatalogue?: string | null;
}) {
  const {
    folderName,
    folderDate,
    shoppingMall,
    documentation,
    catalogue,
    subCatalogue,
  } = data;

  return prisma.folder.create({
    data: {
      name: folderName,
      date: new Date(folderDate),
      // shoppingMall: shoppingMall || null,
      // documentation: documentation || null,
      // catalogue: catalogue || null,
      // subCatalogue: subCatalogue || null,
    },
  });
}

export function parseFilesFormData(formData: FormData) {
  const files = formData.getAll("files") as File[];
  const filesMetadataRaw = formData.get("filesMetadata") as string | null;

  let filesMetadata: UploadedFileMetadata[] = [];

  if (filesMetadataRaw) {
    filesMetadata = JSON.parse(filesMetadataRaw);
  }

  return {
    files,
    filesMetadata,
  };
}