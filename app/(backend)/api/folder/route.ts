import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  createFolder,
  parseFilesFormData,
  saveFilesToFolder,
} from "@/lib/server/file-upload.service";

const UPLOAD_DIR = path.join(process.cwd(), "..", "uploads");

export async function GET() {
  const folders = await prisma.folder.findMany({
    select: {
      name: true,
      id: true,
      date: true,
      _count: true
    },
    orderBy: {
      updatedAt: "desc"
    },
  });

  return NextResponse.json(folders);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const folderName = formData.get("folderName") as string;
    const folderDate = formData.get("folderDate") as string;
    const shoppingMall = formData.get("shoppingMall") as string | null;
    const documentation = formData.get("documentation") as string | null;
    const catalogue = formData.get("catalogue") as string | null;
    const subCatalogue = formData.get("subCatalogue") as string | null;

    if (!folderName || !folderDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { files, filesMetadata } = parseFilesFormData(formData);

    const folder = await createFolder({
      folderName,
      folderDate,
      shoppingMall,
      documentation,
      catalogue,
      subCatalogue,
    });

    const createdFiles = await saveFilesToFolder({
      folderId: folder.id,
      files,
      filesMetadata,
    });

    return NextResponse.json(
      {
        folder,
        files: createdFiles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create folder and upload files" },
      { status: 500 }
    );
  }
}

// export async function POST(request: Request){

//   const formData = await request.formData();

//   const folderName =
//     formData.get("folderName") as string;
//   const folderDate =
//     formData.get("folderDate") as string;
//   const shoppingMall =
//     formData.get("shoppingMall") as string;
//   const documentation =
//     formData.get("documentation") as string;
//   const catalogue =
//     formData.get("catalogue") as string;
//   const subCatalogue =
//     formData.get("subCatalogue") as string;
//   const files =
//     formData.getAll("files") as File[];
//   const filesMetadataRaw =
//     formData.get("filesMetadata") as string;

//   if(!folderName || !folderDate){
//     return NextResponse.json(
//       {error:"Missing fields"},
//       {status:400}
//     );
//   }

//   let filesMetadata = [];

//   if(filesMetadataRaw){
//     filesMetadata =
//       JSON.parse(filesMetadataRaw);
//   }

//   if(files.length !== filesMetadata.length){
//     return NextResponse.json(
//       {error:"Files metadata mismatch"},
//       {status:400}
//     );
//   }

//   // Create folder
//   const folder = await prisma.folder.create({

//     data:{
//       name:folderName,
//       date:new Date(folderDate),
//       // TRC,
//       // Documentation,
//       // Catalogue,
//       // Subcatalogue,
//     }

//   });

//   // Create directory
//   const folderDir = path.join(
//     UPLOAD_DIR,
//     folder.id
//   );

//   await fs.mkdir(
//     folderDir,
//     {recursive:true}
//   );

//   // Save files
//   for(let i=0;i<files.length;i++){

//     const file = files[i];

//     const metadata =
//       filesMetadata[i];

//     const buffer = Buffer.from(
//       await file.arrayBuffer()
//     );

//     const ext =
//       path.extname(file.name);

//     const storedName =
//       crypto.randomUUID() +
//       ext;

//     const filePath =
//       path.join(folderDir,storedName);

//     await fs.writeFile(
//       filePath,
//       buffer
//     );

//     await prisma.file.create({

//       data:{
//         folderId:folder.id,
//         originalFilename:
//           file.name,
//         storedFilename:
//           storedName,
//         filePath:
//           filePath,
//         mimeType:
//           file.type,
//         fileSize:
//           file.size,
//         systemName:
//           file.name,
//         physicalLocation:
//           metadata.physicalLocation || null
//       }
//     });
//   }
//   return NextResponse.json(
//     folder,
//     {status:201}
//   );
// }