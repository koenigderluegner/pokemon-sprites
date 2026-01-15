import fs from 'fs/promises';
import { createWriteStream, WriteStream } from 'fs';
import path from 'path';
import { PokemonEntry, PokemonIconPair } from '../shared/types';
import { DATA_JSON_PATH, DOCS_DIR } from '../shared/constants';

async function main() {
  try {
    const dataContent = await fs.readFile(DATA_JSON_PATH, 'utf8');
    const pokemonEntries: PokemonEntry[] = JSON.parse(dataContent);

    const indexPath = path.join(DOCS_DIR, 'index.html');
    const writeStream = createWriteStream(indexPath, { encoding: 'utf-8' });

    writeStream.on('finish', () => {
      console.log('Successfully wrote index.html');
    });

    writeDocumentHeader(writeStream);
    writeTableOfContents(writeStream);
    writeTableHeader(writeStream);

    for (const entry of pokemonEntries) {
      writeTableSpriteRow(writeStream, entry);
    }

    writeTableFooter(writeStream);
    writeCredits(writeStream);
    writeDocumentFooter(writeStream);

    writeStream.end();
  } catch (error) {
    console.error('Failed to generate docs:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function writeTableHeader(stream: WriteStream) {
  stream.write(
    `<div class="table-wrapper"><table>
<thead>
<tr>
<th class="dex-col">#</th>
<th class="name-col">Name</th>
<th>Form</th>
<th class="min-width">Regular</th>
<th class="min-width">Shiny</th>
</tr>
</thead>
<tbody>`
  );
}

function writeTableFooter(stream: WriteStream) {
  stream.write(
    `</tbody>
</table></div>`
  );
}

function writeTableSpriteRow(stream: WriteStream, entry: PokemonEntry) {
  stream.write(
    `<tr>
<td class="dex-col" id="${entry.id}" rowspan="${entry.icons.length}"><a href="#${entry.id}">${entry.id}</a></td>
<td class="name-col" id="${entry.species}" rowspan="${entry.icons.length}"><a href="#${entry.species}">${entry.species}</a></td>
${getIconFields(entry.icons[0], entry.species)}
</tr>`,
    'utf-8'
  );

  if (entry.icons.length > 1) {
    for (let i = 1; i < entry.icons.length; i++) {
      const speciesNameFromIcon = entry.icons[0].regular.name.split('-')[0];
      stream.write(
        `<tr>
${getIconFields(entry.icons[i], speciesNameFromIcon)}
</tr>`,
        'utf-8'
      );
    }
  }
}

function getIconFields(iconPair: PokemonIconPair, speciesName: string): string {
  const regularClasses = iconPair.regular.cssClass
    .split('.')
    .filter((s) => !!s)
    .join(' ');
  const shinyClasses = iconPair.shiny?.cssClass.split('.').filter((s) => !!s).join(' ') ?? '';
  const formName =
    iconPair.regular.name.length > speciesName.length
      ? iconPair.regular.name.substring(speciesName.length + 1)
      : '-';

  return `
<td>${formName}</td>
  <td>
  <div class="sprite-with-text">
  <div class="${regularClasses}"></div>
  <button title="Copy CSS class" onclick="clipboard('${regularClasses}')">
  <img width="24" height="24" src="./clipboard.svg">
  </button>
   <button title="Download PNG" onclick="downloadImage('${iconPair.regular.name}')">
  <img width="24" height="24" src="./download.svg">
  </button>
  </div>
  </td>
<td>
<div class="sprite-with-text">${iconPair.shiny ? `<div class="${shinyClasses}"></div>` : ''}${
    !iconPair.shiny?.name ? '-' : ''
  } ${
    iconPair.shiny
      ? `<button title="Copy CSS class" onclick="clipboard('${shinyClasses}')"><img width="24" height="24" src="./clipboard.svg"></button>   <button title="Download PNG" onclick="downloadImage('${iconPair.shiny.name}')">
  <img width="24" height="24" src="./download.svg">
  </button>`
      : ''
  }</div></td>`;
}

function writeDocumentHeader(stream: WriteStream) {
  stream.write(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pokémon Sprite - Index</title>
    <link href="./docs.css" rel="stylesheet"/>
    <link href="./spritesheet.css" rel="stylesheet"/>
    <script type="text/javascript">
    function clipboard(text){
      navigator.clipboard.writeText(text);
    }

    async function downloadImage(iconName) {
      const url = 'https://raw.githubusercontent.com/koenigderluegner/pokemon-sprites/refs/heads/main/apps/pokemon-sprite/sprites/' + iconName + '.png';
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download =  iconName + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
    </script>
  </head>
  <body class="container">
<h1>Pokémon sprites</h1>`,
    'utf-8'
  );
}

function writeTableOfContents(stream: WriteStream) {
  stream.write(
    `<ul>
<li><a href="#Bulbasaur">#0001 Bulbasaur</a></li>
<li><a href="#Chikorita">#0152 Chikorita</a></li>
<li><a href="#Treecko">#0252 Treecko</a></li>
<li><a href="#Turtwig">#0387 Turtwig</a></li>
<li><a href="#Victini">#0494 Victini</a></li>
<li><a href="#Chespin">#0650 Chespin</a></li>
<li><a href="#Rowlet">#0722 Rowlet</a></li>
<li><a href="#Grookey">#0810 Grookey</a></li>
<li><a href="#Sprigatito">#0906 Sprigatito</a></li>
<li><a href="#Egg">Eggs</a></li>
<li><a href="#credits">Credits</a></li>
</ul>`,
    'utf-8'
  );
}

function writeCredits(stream: WriteStream) {
  stream.write(
    `
<a id="credits"></a><h2>Credits</h2>
<p>The sprite images are © Nintendo/Creatures Inc./GAME FREAK Inc.</p>
<p>This is a list of present and past contributors which provided custom icons. Thank you!</p>
<div class="credits">
<a href="https://github.com/5310" rel="nofollow noopener" target="_blank">5310</a>
<a href="https://www.deviantart.com/acpeters" rel="nofollow noopener" target="_blank">acpeters</a>
<span>axel_codeinfinity</span>
<a href="https://bsky.app/profile/bananannertoast.bsky.social" rel="nofollow noopener" target="_blank">bananannertoast</a>
<a href="https://www.deviantart.com/boludart" rel="nofollow noopener" target="_blank">boludart</a>
<a href="https://www.deviantart.com/carmanekko" rel="nofollow noopener" target="_blank">carmanekko</a>
<span>Cesare_CBass</span>
<a href="https://www.deviantart.com/ezerart" rel="nofollow noopener" target="_blank">ezerart</a>
<a href="https://www.deviantart.com/flashythepegasus" rel="nofollow noopener" target="_blank">flashythepegasus</a>
<a href="https://www.deviantart.com/floriandx" rel="nofollow noopener" target="_blank">floriandx</a>
<span>Frander04</span>
<a href="https://www.deviantart.com/futuresushi" rel="nofollow noopener" target="_blank">futuresushi</a>
<span>gab_thebest</span>
<a href="https://www.deviantart.com/grand-emperor-z" rel="nofollow noopener" target="_blank">grand-emperor-z</a>
<a href="https://www.deviantart.com/hexechroma" rel="nofollow noopener" target="_blank">hexechroma</a>
<a href="https://www.deviantart.com/larryturbo" rel="nofollow noopener" target="_blank">larryturbo</a>
<a href="https://www.deviantart.com/leparagon" rel="nofollow noopener" target="_blank">leparagon</a>
<a href="https://www.deviantart.com/mbcmechachu" rel="nofollow noopener" target="_blank">mbcmechachu</a>
<a href="https://www.deviantart.com/multidiegodani" rel="nofollow noopener" target="_blank">multidiegodani</a>
<a href="https://www.deviantart.com/radicalcharizard" rel="nofollow noopener" target="_blank">radicalcharizard</a>
<a href="https://www.deviantart.com/robertovile" rel="nofollow noopener" target="_blank">robertovile</a>
<span>TraviS</span>
<a href="https://www.deviantart.com/ushcale" rel="nofollow noopener" target="_blank">ushcale</a>
<span>Vent</span>
<a href="https://www.deviantart.com/wolfang62" rel="nofollow noopener" target="_blank">wolfang62</a>
<a href="https://www.deviantart.com/zerudez" rel="nofollow noopener" target="_blank">zerudez</a>
</div>
<p>Missing your name? <a href="https://discord.com/users/161955738690912257">Contact me via Discord</a>. Links to external sites are not managed by me and have uncontrolled content.</p>
`,
    'utf-8'
  );
}

function writeDocumentFooter(stream: WriteStream) {
  stream.write(
    `</body>
</html>`,
    'utf-8'
  );
}

main();
