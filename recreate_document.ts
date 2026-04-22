import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import pLimit from 'p-limit';
import { prisma } from './lib/prisma';
import 'dotenv/config';

const UPLOADS_DIR = path.resolve('../uploads');
const BACKUP_DIR = path.resolve('../backup');
const LOG_DIR = path.resolve('../logs');
const LOG_FILE = path.join(LOG_DIR, `backup-${Date.now()}.log`);


const CONCURRENCY = 5;
const limit = pLimit(CONCURRENCY);

// --- Helpers ---

await fs.ensureDir(LOG_DIR);

function log(message: string) {
  const time = new Date().toISOString();
  const line = `[${time}] ${message}`;

  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function logError(message: string) {
  const time = new Date().toISOString();
  const line = `[${time}] ERROR: ${message}`;

  console.error(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function formatDate(date: Date): string {
  return new Date(date).toISOString().replace(/[:.]/g, '-');
}

async function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function copyWithRetry(src: string, dest: string, retries = 3, delayMs = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fs.copy(src, dest);
      return;
    } catch (err: any) {
      if (err.code === 'EBUSY' && attempt < retries) {
        log(`EBUSY on attempt ${attempt}, retrying in ${delayMs}ms: ${src}`);
        await new Promise(res => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
}

async function verifyIntegrity(src: string, dest: string, expectedSize: number) {
  const [srcStat, destStat] = await Promise.all([
    fs.stat(src),
    fs.stat(dest),
  ]);

  if (srcStat.size !== destStat.size || destStat.size !== expectedSize) {
    throw new Error('Size mismatch');
  }

  const [srcHash, destHash] = await Promise.all([
    hashFile(src),
    hashFile(dest),
  ]);

  if (srcHash !== destHash) {
    throw new Error('Hash mismatch');
  }
}

async function getCategoryPath(
  category: any,
  cache: Map<string, string[]>
): Promise<string[]> {
  if (cache.has(category.id)) return cache.get(category.id)!;

  if (!category.parentId) {
    cache.set(category.id, [category.name]);
    return [category.name];
  }

  const parent = await prisma.category.findUnique({
    where: { id: category.parentId },
  });

  if (!parent) throw new Error('Parent category not found');

  const parentPath = await getCategoryPath(parent, cache);
  const fullPath = [...parentPath, category.name];

  cache.set(category.id, fullPath);
  return fullPath;
}

async function ensureUniqueDir(
  basePath: string,
  name: string,
  updatedAt: Date
): Promise<string> {
  let dirPath = path.join(basePath, name);

  if (!(await fs.pathExists(dirPath))) return dirPath;

  return path.join(basePath, `${name}_${formatDate(updatedAt)}`);
}

// async function ensureUniqueFile(
//   filePath: string,
//   updatedAt: Date
// ): Promise<string> {
//   if (!(await fs.pathExists(filePath))) return filePath;

//   const ext = path.extname(filePath);
//   const base = path.basename(filePath, ext);
//   const dir = path.dirname(filePath);

//   return path.join(dir, `${base}_${formatDate(updatedAt)}${ext}`);
// }

async function ensureUniqueFile(filePath: string, updatedAt: Date): Promise<string> {
  if (!(await fs.pathExists(filePath))) return filePath;

  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // Try timestamp suffix first
  const timestamped = path.join(dir, `${base}_${formatDate(updatedAt)}${ext}`);
  if (!(await fs.pathExists(timestamped))) return timestamped;

  // Fall back to counter if timestamp also collides
  let counter = 2;
  while (true) {
    const candidate = path.join(dir, `${base}_${formatDate(updatedAt)}_${counter}${ext}`);
    if (!(await fs.pathExists(candidate))) return candidate;
    counter++;
  }
}

// --- Progress ---

function createProgress(total: number) {
  let completed = 0;

  return () => {
    completed++;
    const percent = ((completed / total) * 100).toFixed(2);

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${percent}% (${completed}/${total})`);
  };
}

// --- Main ---

// async function runBackup() {
//   await fs.ensureDir(BACKUP_DIR);
//   log('Backup started');

//   const folders = await prisma.folder.findMany({
//     include: {
//       category: true,
//       files: true,
//     },
//   });

//   const totalFiles = folders.reduce((acc, f) => acc + f.files.length, 0);
//   const updateProgress = createProgress(totalFiles);

//   const categoryCache = new Map<string, string[]>();

//   const tasks: Promise<void>[] = [];

//   for (const folder of folders) {
//     const categoryPathParts = await getCategoryPath(
//       folder.category,
//       categoryCache
//     );

//     let currentPath = BACKUP_DIR;
//     for (const part of categoryPathParts) {
//       currentPath = path.join(currentPath, part);
//     }

//     const finalFolderPath = await ensureUniqueDir(
//       currentPath,
//       folder.name,
//       folder.updatedAt
//     );

//     await fs.ensureDir(finalFolderPath);

//     for (const file of folder.files) {
//       tasks.push(
//         limit(async () => {
//           const srcPath = path.join(
//             UPLOADS_DIR,
//             folder.id,
//             file.storedFilename
//           );

//           let targetPath = path.join(
//             finalFolderPath,
//             file.uploadFilename
//           );

//           targetPath = await ensureUniqueFile(
//             targetPath,
//             file.updatedAt
//           );

//           try {
//             await copyWithRetry(srcPath, targetPath);

//             // ✅ integrity check
//             await verifyIntegrity(srcPath, targetPath, file.fileSize);

//             log(`Copied: ${file.uploadFilename}`);
//             updateProgress();
//           } catch (err: any) {
//             logError(`File ${file.id} failed: ${err.message}`);
//           }
//         })
//       );
//     }
//   }

//   await Promise.all(tasks);

//   console.log('\n✅ Backup completed');
//   log('Backup completed');
// }

async function runBackup() {
  await fs.ensureDir(LOG_DIR);
  await fs.ensureDir(BACKUP_DIR);
  log('Backup started');

  const folders = await prisma.folder.findMany({
    include: { category: true, files: true },
  });

  const totalFiles = folders.reduce((acc, f) => acc + f.files.length, 0);
  const updateProgress = createProgress(totalFiles);
  const categoryCache = new Map<string, string[]>();

  // Track used paths in-process to avoid races
  const usedPaths = new Set<string>();

  function resolveUniquePath(filePath: string, updatedAt: Date): string {
    if (!usedPaths.has(filePath)) {
      usedPaths.add(filePath);
      return filePath;
    }

    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const timestamped = path.join(dir, `${base}_${formatDate(updatedAt)}${ext}`);

    if (!usedPaths.has(timestamped)) {
      usedPaths.add(timestamped);
      return timestamped;
    }

    let counter = 2;
    while (true) {
      const candidate = path.join(dir, `${base}_${formatDate(updatedAt)}_${counter}${ext}`);
      if (!usedPaths.has(candidate)) {
        usedPaths.add(candidate);
        return candidate;
      }
      counter++;
    }
  }

  const tasks: Promise<void>[] = [];

  for (const folder of folders) {
    const categoryPathParts = await getCategoryPath(folder.category, categoryCache);

    let currentPath = BACKUP_DIR;
    for (const part of categoryPathParts) {
      currentPath = path.join(currentPath, part);
    }

    const finalFolderPath = await ensureUniqueDir(currentPath, folder.name, folder.updatedAt);
    await fs.ensureDir(finalFolderPath);

    for (const file of folder.files) {
      const srcPath = path.join(UPLOADS_DIR, folder.id, file.storedFilename);
      const rawTarget = path.join(finalFolderPath, file.uploadFilename);
      
      // Resolve path synchronously before any concurrency
      const targetPath = resolveUniquePath(rawTarget, file.updatedAt);

      tasks.push(
        limit(async () => {
          try {
            await copyWithRetry(srcPath, targetPath);
            await verifyIntegrity(srcPath, targetPath, file.fileSize);
            log(`Copied: ${file.uploadFilename} → ${path.basename(targetPath)}`);
            updateProgress();
          } catch (err: any) {
            logError(`File ${file.id} (${file.uploadFilename}) failed: ${err.message}`);
            updateProgress();
          }
        })
      );
    }
  }

  await Promise.all(tasks);
  log('Backup completed');
  console.log('\n✅ Backup completed');
}


runBackup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());