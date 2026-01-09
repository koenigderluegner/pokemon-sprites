import fs from 'fs';
import * as unzipper from 'unzipper';
import fg from 'fast-glob';
import path from 'path';

const entries: string[] = fg.sync([fg.convertPathToPattern(path.join(__dirname, './*.zip'))], {dot: true});

if (entries.length !== 1) throw new Error('Found ' + entries.length + ' zip files, expected 1.');

async function unpack() {
  await fs.createReadStream(entries[0])
    .pipe(unzipper.Extract({path: path.join(__dirname, '../assets/icons/menu-sprites')}))
    .promise();

  console.log('Unpacked successfully!');
}

unpack();
