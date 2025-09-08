import fs from 'fs';
import path from 'path';
import { PokemonEntry } from '../generate-docs/pokemon-entry';
import spritesmith from 'spritesmith';


const docsOutputDest = path.join(__dirname, '../../../../docs');
const iconInputLocation = path.join(__dirname, '../assets/icons/menu-sprites/')

const convertedPokemonEntries = fs.readFileSync(path.join(__dirname, '../assets/converter/converted-pokemon-entries.json'),
  {encoding: 'utf8', flag: 'r'});

const pokemonEntries: PokemonEntry[] = JSON.parse(convertedPokemonEntries);


const sprites = pokemonEntries.map(entry => {
  return [entry.icons.map(icon => icon.regular.name), entry.icons.map(icon => icon.shiny?.name)];
}).flat(2).filter((s): s is string => s !== undefined).map(s => iconInputLocation + s + '.png');

spritesmith.run({src: sprites}, function handleResult(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  // result.image; // Buffer representation of image
  result.coordinates; // Object mapping filename to {x, y, width, height} of image
  result.properties; // Object with metadata about spritesheet {width, height}

  fs.writeFileSync(path.join(docsOutputDest, 'spritesheet.png'), result.image);


});
