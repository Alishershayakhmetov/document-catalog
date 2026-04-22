import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const UPLOAD_DIR = process.env.UPLOAD_DIR!;

export type UploadedFileMetadata = {
  physicalLocation?: string | null;
  systemName?: string | null;
	date?: string | null;
  description? : string | null;
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

  const writtenPaths: string[] = [];
  const createdFileIds: string[] = [];

  try {
    const createdFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const metadata = filesMetadata[i];

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const storedName = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(folderDir, storedName);

      await fs.writeFile(filePath, buffer);
      writtenPaths.push(filePath); // track before DB write

      const createdFile = await prisma.file.create({
        data: {
          folderId,
          uploadFilename: file.name,
          storedFilename: storedName,
          mimeType: file.type,
          fileSize: file.size,
          date: metadata.date ? new Date(metadata.date) : new Date(),
          systemName: metadata.systemName || file.name,
          physicalLocation: metadata.physicalLocation || null,
          description: metadata.description,
        },
      });
      createdFileIds.push(createdFile.id); // track before next iteration
      createdFiles.push(createdFile);
    }

    return createdFiles;
  } catch (error) {
    // Roll back filesystem writes
    await Promise.allSettled(
      writtenPaths.map((p) => fs.unlink(p).catch(() => {}))
    );

    // Roll back DB records
    if (createdFileIds.length > 0) {
      await prisma.file.deleteMany({
        where: { id: { in: createdFileIds } },
      }).catch(() => {});
    }

    throw error; // re-throw so the POST handler returns 500
  }
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