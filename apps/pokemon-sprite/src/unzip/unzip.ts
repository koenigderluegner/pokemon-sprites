import fs from 'fs';
import * as unzipper from 'unzipper';
import path from 'path';

const targetPath = path.join(__dirname, '../assets/icons/menu-sprites');
const zipPaths: string[] = fs.readdirSync(__dirname).filter(s => s.toLocaleLowerCase().endsWith('.zip')).map(s => path.join(__dirname, s));
if (zipPaths.length !== 1) throw new Error(`Found ${zipPaths.length} zip files, expected exactly 1. \nFound files: ${zipPaths.join(', ')}`);

const zipPath = zipPaths[0];

console.log(`Unpacking ${zipPath} to ${targetPath}`);

async function unpack() {
  fs.rmSync(targetPath, {recursive: true, force: true});
  fs.mkdirSync(targetPath, {recursive: true});
  const directory = await unzipper.Open.file(zipPath);


  for (const entry of directory.files) {
    const isFileInNormalDirectory = entry.path.startsWith('Normal/') && entry.type === 'File';
    if (isFileInNormalDirectory) {
      const fileName = entry.path.replace('Normal/', '');
      const fullPath = path.join(targetPath, fileName);

      const content = await entry.buffer();
      fs.writeFileSync(fullPath, content);
    }
  }

  console.log('Unpacked successfully!');
}

unpack();
