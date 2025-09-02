import fs from 'fs';
import path from 'path';
import { PokemonEntry, PokemonIconPair } from './pokemon-entry';


const docsOutputDest = path.join(__dirname, '../../../../docs');

const convertedPokemonEntries = fs.readFileSync(path.join(__dirname, '../assets/converter/converted-pokemon-entries.json'),
  {encoding: 'utf8', flag: 'r'});

const pokemonEntries: PokemonEntry[] = JSON.parse(convertedPokemonEntries);

const writeStream = fs.createWriteStream(path.join(docsOutputDest, 'index.html'));

writeStream.on('finish', () => {
  console.log('wrote all data to file');
});

writeDocumentHeader(writeStream);
writeTableHeader(writeStream);

pokemonEntries.forEach(entry => writeTableSpriteRow(writeStream, entry));

writeTableFooter(writeStream);

writeDocumentFooter(writeStream);
// the finish event is emitted when all data has been flushed from the stream


// close the stream
writeStream.end();


function writeTableHeader(stream: fs.WriteStream) {

  stream.write(`<table>
<thead>
<tr>
<th>#</th>
<th>Name</th>
<th>Form</th>
<th>Regular</th>
<th>Shiny</th>
</tr>
</thead>
<tbody>`, 'utf-8');


}

function writeTableFooter(stream: fs.WriteStream) {

  stream.write(`</tbody>
</table>`, 'utf-8');


}

function writeTableSpriteRow(stream: fs.WriteStream, entry: PokemonEntry) {

  stream.write(`<tr>
<td rowspan="${entry.icons.length}">${entry.id}</td>
<td rowspan="${entry.icons.length}">${entry.species}</td>
${getIconFields(entry.icons[0])}
</tr>`, 'utf-8');
  if (entry.icons.length > 1) {
    for (let i = 1; i < entry.icons.length; i++) {
      stream.write(`<tr>
${getIconFields(entry.icons[i])}
</tr>`, 'utf-8');
    }

  }


}

function getIconFields(iconPair: PokemonIconPair): string {

  return `
<td>-</td>
  <td><div class="sprite-with-text"><img width="68" height="68" loading="lazy" src="./icons/${iconPair.regular}.png" /> ${iconPair.regular}</div></td>
<td><div class="sprite-with-text">${iconPair.shiny ? `<img width="68" height="68" loading="lazy" src="./icons/${iconPair.shiny}.png" />` : ''}${iconPair.shiny ?? '-'}</div></td>`;
}


function writeDocumentHeader(stream: fs.WriteStream) {

  stream.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pokémon Sprite - Index</title>
    <link href="./docs.css" rel="stylesheet"/>
  </head>
  <body>`, 'utf-8');


}

function writeDocumentFooter(stream: fs.WriteStream) {

  stream.write(`</body>
</html>`, 'utf-8');


}

function copyFolder(src: string, dest: string) {
  try {
    fs.cpSync(src, dest, {recursive: true});
    console.log('Folder copied successfully');
  } catch (error) {
    console.error('Error copying folder:', error);
  }
}

if (false)
  copyFolder(path.join(__dirname, '../assets/icons/menu-sprites'), docsOutputDest + '/icons');



