import fs from 'fs';
import * as unzipper from 'unzipper';
import fg from 'fast-glob';
import path from 'path';


const targetPath = path.join(__dirname, '../assets/icons/menu-sprites');
const convertedPath = fg.convertPathToPattern(path.join(__dirname, './*.zip'));
const zipPaths: string[] = fg.sync([convertedPath], {dot: true});

if (zipPaths.length !== 1) throw new Error(`Found ${zipPaths.length} zip files, expected exactly 1. Used pattern: ${convertedPath}`);

const zipPath = zipPaths[0];

async function unpack() {
  fs.mkdirSync(targetPath, { recursive: true } );
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
