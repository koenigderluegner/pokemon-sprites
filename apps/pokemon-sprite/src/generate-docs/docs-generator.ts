import fs from 'fs';
import path from 'path';
import { PokemonEntry, PokemonIconPair } from './pokemon-entry';
import { execSync } from 'child_process';

const docsOutputDest = path.join(__dirname, '../../../../docs');

const convertedPokemonEntries = fs.readFileSync(path.join(__dirname, '../assets/converter/converted-pokemon-entries.json'),
  {encoding: 'utf8', flag: 'r'});

const pokemonEntries: PokemonEntry[] = JSON.parse(convertedPokemonEntries);

const writeStream = fs.createWriteStream(path.join(docsOutputDest, 'index.html'));

writeStream.on('finish', () => {
  console.log('wrote all data to file');
});

writeDocumentHeader(writeStream);
writeTableOfContents(writeStream);
writeTableHeader(writeStream);

pokemonEntries.forEach(entry => writeTableSpriteRow(writeStream, entry));

writeTableFooter(writeStream);
writeCredits(writeStream)
writeDocumentFooter(writeStream);

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
<td id="${entry.id}" rowspan="${entry.icons.length}"><a href="#${entry.id}">${entry.id}</a></td>
<td id="${entry.species}" rowspan="${entry.icons.length}"><a href="#${entry.species}">${entry.species}</a></td>
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
  <td><div class="sprite-with-text"><img alt="" width="68" height="68" loading="lazy" src="./icons/${iconPair.regular.name}.png" /> ${iconPair.regular?.name}</div></td>
<td><div class="sprite-with-text">${iconPair.shiny ? `<img alt="" width="68" height="68" loading="lazy" src="./icons/${iconPair.shiny.name}.png" />` : ''}${iconPair.shiny?.name ?? '-'}</div></td>`;
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

function writeTableOfContents(stream: fs.WriteStream) {
  stream.write(`<ul>
<li><a href="#Bulbasaur">#0001 Bulbasaur</a></li>
<li><a href="#Chikorita">#0152 Chikorita</a></li>
<li><a href="#Treecko">#0252 Treecko</a></li>
<li><a href="#Turtwig">#0387 Turtwig</a></li>
<li><a href="#Victini">#0494 Victini</a></li>
<li><a href="#Chespin">#0650 Chespin</a></li>
<li><a href="#Rowlet">#0722 Rowlet</a></li>
<li><a href="#Grookey">#0810 Grookey</a></li>
<li><a href="#Sprigatito">#0906 Sprigatito</a></li>
<li><a href="#credits">Credits</a></li>
</ul>`, 'utf-8');
}

function writeCredits(stream: fs.WriteStream) {
  stream.write(`
<a id="credits"></a><h2>Credits</h2>
The sprite images are © Nintendo/Creatures Inc./GAME FREAK Inc.
This is a list of present and past contributors which provided custom icons. Thank you!
<div class="credits">
<a href="https://github.com/5310" rel="nofollow noopener" target="_blank">5310</a>
<a href="https://www.deviantart.com/acpeters" rel="nofollow noopener" target="_blank">acpeters</a>
<a href="https://bsky.app/profile/bananannertoast.bsky.social" rel="nofollow noopener" target="_blank">bananannertoast</a>
<a href="https://www.deviantart.com/boludart" rel="nofollow noopener" target="_blank">boludart</a>
<a href="https://www.deviantart.com/carmanekko" rel="nofollow noopener" target="_blank">carmanekko</a>
<a href="https://www.deviantart.com/ezerart" rel="nofollow noopener" target="_blank">ezerart</a>
<a href="https://www.deviantart.com/flashythepegasus" rel="nofollow noopener" target="_blank">flashythepegasus</a>
<a href="https://www.deviantart.com/floriandx" rel="nofollow noopener" target="_blank">floriandx</a>
<span>Frander04</span>
<a href="https://www.deviantart.com/futuresushi" rel="nofollow noopener" target="_blank">futuresushi</a>
<a href="https://www.deviantart.com/grand-emperor-z" rel="nofollow noopener" target="_blank">grand-emperor-z</a>
<a href="https://www.deviantart.com/hexechroma" rel="nofollow noopener" target="_blank">hexechroma</a>
<a href="https://www.deviantart.com/larryturbo" rel="nofollow noopener" target="_blank">larryturbo</a>
<a href="https://www.deviantart.com/leparagon" rel="nofollow noopener" target="_blank">leparagon</a>
<a href="https://www.deviantart.com/mbcmechachu" rel="nofollow noopener" target="_blank">mbcmechachu</a>
<a href="https://www.deviantart.com/multidiegodani" rel="nofollow noopener" target="_blank">multidiegodani</a>
<a href="https://www.deviantart.com/radicalcharizard" rel="nofollow noopener" target="_blank">radicalcharizard</a>
<a href="https://www.deviantart.com/robertovile" rel="nofollow noopener" target="_blank">robertovile</a>
<span>TraviS</span>
<a href="https://www.deviantart.com/trippytooni" rel="nofollow noopener" target="_blank">trippytooni</a>
<a href="https://www.deviantart.com/ushcale" rel="nofollow noopener" target="_blank">ushcale</a>
<a href="https://www.deviantart.com/wolfang62" rel="nofollow noopener" target="_blank">wolfang62</a>
<a href="https://www.deviantart.com/zerudez" rel="nofollow noopener" target="_blank">zerudez</a>
<span>Vent</span>
</div>
<p>Missing your name? <a href="https://discord.com/users/161955738690912257">Contact me via Discord</a>. Links to external sites are not managed by me and have uncontrolled content.</p>
`, 'utf-8');
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

if (getChangedIcons().length > 0)
  copyFolder(path.join(__dirname, '../assets/icons/menu-sprites'), docsOutputDest + '/icons');


function getChangedIcons() {
  const command = `git diff --staged --name-only`;
  const diffOutput = execSync(command).toString();
  return diffOutput.toString().split('\n').filter(Boolean).filter(x => x.includes('apps/pokemon-sprite/src/assets/icons/menu-sprites/'));
}
