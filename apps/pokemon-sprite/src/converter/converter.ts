import path from "path";
import { Worksheets } from "./worksheets";

import fg from 'fast-glob';
import fs from 'fs';


const spritePath = path.join(__dirname, '../assets/icons/menu-sprites/');
const entries: string[] = fg.sync([fg.convertPathToPattern(spritePath + '*.png')], { dot: true });
const iconBaseNames = entries.map(s => s.split('/').pop() ?? '').filter(s => s.startsWith('0') && !s.startsWith('0000') || s.startsWith('1'));

const worksheetsFileContent = fs.readFileSync(path.join(__dirname, '../assets/spreadsheet/worksheets.json'),
  { encoding: 'utf8', flag: 'r' });

const worksheets = JSON.parse(worksheetsFileContent) as Worksheets;
const menuSpritesWorksheet = worksheets.valueRanges.find(w => w.range.toLowerCase().includes('menu'));

if (!menuSpritesWorksheet) throw new Error('No worksheet for menu sprites found!');

const anyLetterRegEx = /[a-z]/i;
const worksheetValues = menuSpritesWorksheet
  .values
  .filter(s => s[0].startsWith('#0') && !s[0].startsWith('#0000') || s[0].startsWith('#1'))
  // skip anime, bonus etc
  .filter(s => !anyLetterRegEx.test(s[0]))
  // skip Go images
  .filter(s => !s[1].toLowerCase().includes('(go') && !s[1].toLowerCase().includes('pokémon go'))
  // skip rotom phones
  .filter(s => !s[1].toLowerCase().includes('smart phone'))
  .map(values => (
    {
      key: values[0].replace('#', ''),
      name: values[1].split('\n').map(s => s.replace('(', '').replace(')', '').trim()),
      '3ds': {
        origin:  values[4],
        qualityControl: values[5]
      },
      switch: {
        origin:  values[2],
        qualityControl: values[3]
      },
    }
  ));

worksheetValues.forEach(() => ({}))


const pokemonEntries = worksheetValues.map(spriteEntry => {
  const key = spriteEntry.key.replace(/ +/g, '');
  const regularKey = `${key} `;
  const shinyKey = `${key}-★ Shiny`;


  const iconsRegular = iconBaseNames.filter(s => s.startsWith(regularKey));
  const iconsShiny = iconBaseNames.filter(s => s.startsWith(shinyKey));


  if (!iconsRegular.length) console.warn(`missing regular icons for "${key}" - ${spriteEntry.name[0]} - ${spriteEntry.name[1]}`);
  if (!iconsShiny.length) console.warn(`missing shiny icons for "${key}" - ${spriteEntry.name[0]}`);
  if (iconsShiny.length !== iconsRegular.length) console.warn(`unequal amount of icons for "${key}" - ${spriteEntry.name[0]}`);

  return { ...spriteEntry, iconsRegular, iconsShiny };

})

fs.writeFileSync(path.join(__dirname, "../assets/converter/converted-pokemon-entries.json"), JSON.stringify(pokemonEntries));
