/// <reference path="./layout.d.ts" />
import fs from 'fs';
import path from 'path';
import { IconMeta, PokemonEntry } from '../generate-docs/pokemon-entry';
import spritesmith from 'spritesmith';
import sharp from 'sharp';
import * as layout from 'layout';



const sort = (items: any) => items
const useCSSNesting = true;

const docsOutputDest = path.join(__dirname, '../../../../docs');
const iconInputLocation = path.join(__dirname, '../assets/icons/menu-sprites/');

const convertedPokemonEntries = fs.readFileSync(path.join(__dirname, '../assets/converter/converted-pokemon-entries.json'),
  {encoding: 'utf8', flag: 'r'});

const pokemonEntries: PokemonEntry[] = JSON.parse(convertedPokemonEntries);
const icons = pokemonEntries.map(entry => {
  return entry.icons.map(icon => [icon.regular, icon.shiny]);
}).flat(2).filter((s): s is IconMeta => !!s);
// taken from https://github.com/msikma/pokesprite-gen/blob/27b51fd5ef340b4ceb82d8102a5d81ac3f994566/packages/lib/spritesmith/layout.js
const placeItemsWithMaxWidth = (maxWidth: number) => (items: any[]) => {
  let x = 0
  let y = 0
  let maxHeight = 0

  items.forEach(item => {
    if (x + item.width > maxWidth) {
      x = 0
      y += maxHeight
      maxHeight = 0
    }
    item.x = x
    item.y = y

    x += item.width
    maxHeight = Math.max(maxHeight, item.height)
  })

  return items
}

const sprites = icons.map(s => iconInputLocation + s.name + '.png');
sprites.unshift(iconInputLocation + 'Placeholder.png')
layout.addAlgorithm('pokesprite-left-right', { sort, placeItems: placeItemsWithMaxWidth(2176) })
// @ts-ignore
spritesmith.run({src: sprites, algorithm: 'pokesprite-left-right'}, function handleResult(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  generateCssFile(icons, result.coordinates);
  sharp(result.image).png().toFile(path.join(docsOutputDest, 'spritesheet.png'));


});


function generateCssFile(iconMeta: IconMeta[], coordinates: Record<string, {
  x: number,
  y: number,
  width: number,
  height: number
}>) {
  let basicStyles = `
  .pokesprite {
    display: inline-block;
}
.pokesprite.pokemon {
    width: 68px;
    height: 68px;
    background-image: url(./spritesheet.png);
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;

  `;
  if (!useCSSNesting) {
    basicStyles += `}`;
  }

  const iconCss = (Object.entries(coordinates).map(([iconName, {x, y}]) => {
    const iconMetaEntry = iconMeta.find(i => i.name === path.basename(iconName, '.png'));
    if (iconMetaEntry) {

      const selector = useCSSNesting ? iconMetaEntry.cssClass.replace('.pokesprite.pokemon', '&') : iconMetaEntry.cssClass;
      return `${selector} { background-position:  ${x === 0 ? x : -x + 'px'} ${y === 0 ? y : -y + 'px'}; }`;
    }
    return null;

  }).filter(Boolean) as string[]).join('\n');

  if (useCSSNesting) {
    basicStyles += iconCss + `}`;
  } else {
    basicStyles += iconCss;
  }

  fs.writeFileSync(path.join(docsOutputDest, 'spritesheet.css'), basicStyles,
    {encoding: 'utf8', flag: 'w'});


}
