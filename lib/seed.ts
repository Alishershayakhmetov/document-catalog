import { prisma } from './prisma'

async function main() {

await prisma.users.create({
  data:{
    name:"Admin",
    email:"admin@test.com",
    passwordHash:"hash",
    role:"ADMIN"
  }
})

const folder = await prisma.folder.create({
  data:{
    name:"Test Folder",
    date:new Date()
  }
})

await prisma.file.create({
  data:{
    originalFilename:"test.pdf",
    storedFilename:"uuid-test.pdf",
    filePath:"/uploads/uuid-test.pdf",
    fileSize:123456,
    folderId:folder.id,
    systemName:"SYS-100",
    physicalLocation:"Office"
  }
})

}

main()