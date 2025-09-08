import path from 'path';

import fg from 'fast-glob';
import fs from 'fs';
import { speciesList } from './species-list';
import { IconMeta, PokemonEntry, PokemonIconPair } from '../generate-docs/pokemon-entry';

const assetFileEnding = '.png';

const spritePath = path.join(__dirname, '../assets/icons/menu-sprites/');
const entries: string[] = fg.sync([fg.convertPathToPattern(spritePath + '*.png')], {dot: true});
let iconBaseNames = entries.map(s => path.basename(s, assetFileEnding));

const ICON_CATEGORIES = new Set(['go', 'bonus', 'extra']);
const ICON_MODIFIERS = new Set(['★', '3ds', 'switch']);


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

  sortByKeywords(regularIcons).forEach(regularIcon => {
    const shinyIconIndex = shinyIconsIcons.findIndex(x => x.toLowerCase() === regularIcon.toLowerCase() + '-★');

    const shinyIcon = shinyIconsIcons[shinyIconIndex];

    iconPairs.push({
      regular: getIconMeta(regularIcon),
      shiny: shinyIcon ? getIconMeta(shinyIcon) : null,
    });

    if (shinyIconIndex >= 0) {
      shinyIconsIcons.splice(shinyIconIndex, 1);
    }
  });

  if (shinyIconsIcons.length > 0) {
    console.log('missing regular icons for ' + result.species + ': ' + shinyIconsIcons.join(', '));
  }

  pairs.push({
    id: result.id,
    species: result.species,
    icons: iconPairs,
  });

});


fs.writeFileSync(path.join(__dirname, '../assets/converter/converted-pokemon-entries.json'), JSON.stringify(pairs, null, 2));

function getIconMeta(iconName: string): IconMeta {

  const result: IconMeta = {name: iconName, slug: '', cssClass: ''};

  let parts = new Set(iconName.toLowerCase().split('-'));

  const categories = parts.intersection(ICON_CATEGORIES);

  parts = parts.difference(categories);

  const modifiers = parts.intersection(ICON_MODIFIERS);

  parts = parts.difference(modifiers);

  result.slug = [...parts].join('-').replace(/'/g, '');

  if (modifiers.size > 0) {
    if (modifiers.has('★')) {
      modifiers.delete('★');
      modifiers.add('shiny');
    }
    if (modifiers.has('3ds')) {
      modifiers.delete('3ds');
      // css classes should not start with a number
      modifiers.add('n3ds');
    }
    result.modifiers = [...modifiers];
  }

  if (categories.size > 0) {
    result.categories = [...categories];
  }

  const cssClass = result.slug;
  const cssModifiers = result.modifiers?.join('.');
  result.cssClass = `.pokesprite.pokemon.${cssModifiers ? cssClass + '.' + cssModifiers : cssClass}`;

  return result;
}

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


function sortByKeywords(arr: string[]): string[] {
  return arr.sort((a, b) => {
    const getPriority = (str: string) => {
      const lower = str.toLowerCase();
      if (lower.includes('-bonus-')) return 4;
      if (lower.includes('-extra-')) return 3;
      if (lower.includes('-go-')) return 2;
      return 1;
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    if (priorityA === priorityB) {
      return a.localeCompare(b);
    }

    return priorityA - priorityB;
  });
}
