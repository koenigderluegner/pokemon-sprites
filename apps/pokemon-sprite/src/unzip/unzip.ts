import fs from 'fs/promises';
import * as unzipper from 'unzipper';
import path from 'path';
import { SPRITES_DIR } from '../shared/constants';

async function getZipPath(): Promise<string> {
  const files = await fs.readdir(__dirname);
  const zipFiles = files
    .filter((file) => file.toLocaleLowerCase().endsWith('.zip'))
    .map((file) => path.join(__dirname, file));

  if (zipFiles.length !== 1) {
    throw new Error(
      `Found ${zipFiles.length} zip files, expected exactly 1.\nFound files: ${zipFiles.join(', ')}`
    );
  }
  return zipFiles[0];
}

async function unpack(): Promise<void> {
  try {
    const zipPath = await getZipPath();
    console.log(`Unpacking ${zipPath} to ${SPRITES_DIR}`);

    await fs.rm(SPRITES_DIR, { recursive: true, force: true });
    await fs.mkdir(SPRITES_DIR, { recursive: true });

    const directory = await unzipper.Open.file(zipPath);

    const extractionPromises = directory.files
      .filter((entry) => entry.path.startsWith('Normal/') && entry.type === 'File')
      .map(async (entry) => {
        const fileName = entry.path.replace('Normal/', '');
        const fullPath = path.join(SPRITES_DIR, fileName);
        const content = await entry.buffer();
        await fs.writeFile(fullPath, content);
      });

    await Promise.all(extractionPromises);

    console.log('Unpacked successfully!');
  } catch (error) {
    console.error('Failed to unpack:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

unpack();
