import path from 'path';

import fg from 'fast-glob';
import fs from 'fs';
import { speciesList } from './species-list';
import { PokemonEntry, PokemonIconPair } from '../generate-docs/pokemon-entry';

const assetFileEnding = '.png';

const spritePath = path.join(__dirname, '../assets/icons/menu-sprites/');
const entries: string[] = fg.sync([fg.convertPathToPattern(spritePath + '*.png')], {dot: true});
let iconBaseNames = entries.map(s => path.basename(s, assetFileEnding));


const results: {
  id: number
  species: string,
  icons: string[]
}[] = [];



// reverse so paras will not "steal" icons from parasect
speciesList.reverse().forEach(poke => {
  const currentSpeciesForms = getSpeciesIcons(poke);
  if (currentSpeciesForms.length === 0) {
    console.log(poke.species + ' missing!');
  }

  results.push({
    id: poke.id,
    species: poke.species,
    icons: currentSpeciesForms,
  });

  iconBaseNames = iconBaseNames.filter(x => !currentSpeciesForms.includes(x));


});




const pairs: PokemonEntry[] = [];

results.reverse().forEach(result => {

  const regularIcons = result.icons.filter(x => !x.includes('★'));
  const shinyIconsIcons = result.icons.filter(x => x.includes('★'));

  const iconPairs: PokemonIconPair[] = [];

  regularIcons.forEach(regularIcon => {
    const shinyIconIndex = shinyIconsIcons.findIndex(x => x.toLowerCase() === regularIcon.toLowerCase() + '-★');

    const shinyIcon = shinyIconsIcons[shinyIconIndex];

    iconPairs.push({
      regular: regularIcon,
      shiny: shinyIcon ?? null,
    });

    if (shinyIconIndex >= 0) {
      shinyIconsIcons.splice(shinyIconIndex, 1);
    }
  });

  if (shinyIconsIcons.length > 0) {
    console.log('missing shiny icons for ' + result.species);
  }

  pairs.push({
    id: result.id,
    species: result.species,
    icons: iconPairs,
  });

});


fs.writeFileSync(path.join(__dirname, '../assets/converter/converted-pokemon-entries.json'), JSON.stringify(pairs, null, 2));


function getSpeciesIcons(poke: { species: string; id: number }) {
  const iconName = poke.species
    .replace(/Nidoran F/g, 'Nidoran♀')
    .replace(/Nidoran M/g, 'Nidoran♂')
    .replace(/[ \-\.:]/g, '')
    .replace(/Flabebe/g, 'Flabébé');

  return iconBaseNames.filter(x =>
    // Matches pattern followed by space, non-letter, or end of string
    new RegExp(`^${iconName}(?=\\s|[^a-zA-Z]|$)`, 'i').test(x)
  );
}
