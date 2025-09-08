import fs from 'fs';
import path from 'path';
import { IconMeta, PokemonEntry } from '../generate-docs/pokemon-entry';
import spritesmith from 'spritesmith';


const docsOutputDest = path.join(__dirname, '../../../../docs');
const iconInputLocation = path.join(__dirname, '../assets/icons/menu-sprites/');

const convertedPokemonEntries = fs.readFileSync(path.join(__dirname, '../assets/converter/converted-pokemon-entries.json'),
  {encoding: 'utf8', flag: 'r'});

const pokemonEntries: PokemonEntry[] = JSON.parse(convertedPokemonEntries);
const icons = pokemonEntries.map(entry => {
  return [entry.icons.map(icon => icon.regular), entry.icons.map(icon => icon.shiny)];
}).flat(2).filter((s): s is IconMeta => !!s);


const sprites = icons.map(s => iconInputLocation + s.name + '.png');

spritesmith.run({src: sprites}, function handleResult(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  // result.image; // Buffer representation of image
  result.coordinates; // Object mapping filename to {x, y, width, height} of image
  result.properties; // Object with metadata about spritesheet {width, height}
  generateCssFile(icons, result.coordinates);
  fs.writeFileSync(path.join(docsOutputDest, 'spritesheet.png'), result.image);


});


function generateCssFile(iconMeta: IconMeta[], coordinates: Record<string, {
  x: number,
  y: number,
  width: number,
  height: number
}>) {
  const basicStyles = `
  .pokesprite {
    display: inline-block;
}
.pokesprite.pokemon {
    width: 68px;
    height: 68px;
    background-image: url(./spritesheet.png);
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
}
  `;
  const iconCss = (Object.entries(coordinates).map(([iconName, {x, y}]) => {
    const iconMetaEntry = iconMeta.find(i => i.name === path.basename(iconName, '.png'));
    if (iconMetaEntry) {
      return `${iconMetaEntry.cssClass} { background-position:  ${x === 0 ? x : -x + 'px'} ${y === 0 ? y : -y + 'px'}; }`;
    }
    return null;

  }).filter(Boolean) as string[]).join('\n');

  fs.writeFileSync(path.join(docsOutputDest, 'spritesheet.css'), basicStyles + iconCss,
    {encoding: 'utf8', flag: 'w'});


}
