import path from 'path';
import fs from 'fs/promises';
import { globSync } from 'fs';
import { speciesList } from './species-list';
import { IconMeta, PokemonEntry, PokemonIconPair, Species } from '../shared/types';
import { DATA_JSON_PATH, ICON_CATEGORIES, ICON_MODIFIERS, SPRITES_DIR } from '../shared/constants';

const ASSET_FILE_ENDING = '.png';

async function main() {
  try {
    const entries = globSync(SPRITES_DIR.replace(/\\/g, '/') + '/*.png');
    let iconBaseNames = entries.map((s) => path.basename(s, ASSET_FILE_ENDING));

    const speciesResults: {
      id: number;
      species: string;
      icons: string[];
    }[] = [];

    // reverse so paras will not "steal" icons from parasect
    [...speciesList].reverse().forEach((poke) => {
      const currentSpeciesForms = getSpeciesIcons(poke, iconBaseNames);
      if (currentSpeciesForms.length === 0) {
        console.warn(`${poke.species} missing!`);
      }

      speciesResults.push({
        id: poke.id,
        species: poke.species,
        icons: currentSpeciesForms,
      });

      iconBaseNames = iconBaseNames.filter((x) => !currentSpeciesForms.includes(x));
    });

    const pairs: PokemonEntry[] = speciesResults.reverse().map((result) => {
      const regularIcons = result.icons.filter((x) => !x.includes('★'));
      const shinyIcons = result.icons.filter((x) => x.includes('★'));

      const iconPairs: PokemonIconPair[] = sortByKeywords(regularIcons).map((regularIcon) => {
        const shinyIconIndex = shinyIcons.findIndex(
          (x) => x.toLowerCase() === regularIcon.toLowerCase() + '-★',
        );

        const shinyIcon = shinyIconIndex !== -1 ? shinyIcons[shinyIconIndex] : null;

        if (shinyIconIndex !== -1) {
          shinyIcons.splice(shinyIconIndex, 1);
        }

        return {
          regular: getIconMeta(regularIcon),
          shiny: shinyIcon ? getIconMeta(shinyIcon) : null,
        };
      });

      if (shinyIcons.length > 0) {
        console.warn(`Missing regular icons for ${result.species}: ${shinyIcons.join(', ')}`);
      }

      return {
        id: result.id,
        species: result.species,
        icons: iconPairs,
      };
    });

    pairs.forEach((value) => {
      if (!value.icons.some((iconPair) => iconPair.regular.name === value.species)) {
        console.warn(`Missing base regular icon for ${value.species}`);
      }
    });

    await fs.writeFile(DATA_JSON_PATH, JSON.stringify(pairs, null, 2));
    console.log('Conversion successful!');
  } catch (error) {
    console.error('Conversion failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function getIconMeta(iconName: string): IconMeta {
  let sanitizedIconName = iconName.replace(/Minior-Core/g, 'Minior');

  if (sanitizedIconName.startsWith('Alcremie')) {
    sanitizedIconName = sanitizedIconName
      .replace(/sweet/g, '')
      .replace(/swirlcream[^\w]/g, '-swirl')
      .replace(/cream[^\w]/g, '-cream');
  }
  if (sanitizedIconName.startsWith('Urshifu')) {
    sanitizedIconName = sanitizedIconName.replace(/Rapid/g, 'RapidStrike');
    sanitizedIconName = sanitizedIconName.replace(/Single/g, 'SingleStrike');
  }
  if (sanitizedIconName.startsWith('Pikachu')) {
    sanitizedIconName = sanitizedIconName.replace(/cap/g, '-cap');
  }

  sanitizedIconName = sanitizedIconName.replace(/OriginalLivery/g, 'Original'); // magearna

  const result: IconMeta = { name: iconName, slug: '', cssClass: '' };

  let partsArray = sanitizedIconName.split('-');

  partsArray[0] = partsArray[0]
    .replace(/Jangmoo/g, 'Jangmo-o')
    .replace(/Hakamoo/g, 'Hakamo-o')
    .replace(/Kommoo/g, 'Kommo-o')
    .replace(/Nidoran♀/g, 'Nidoran-f')
    .replace(/Nidoran♂/g, 'Nidoran-m')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/é/g, 'e');

  const processedParts = partsArray.map((s, index) =>
    index === 0
      ? s.toLowerCase()
      : s
          .replace(/([a-zéáűőúöüó0-9])([A-Z])/g, '$1-$2')
          .toLowerCase()
          .replace(/é/g, 'e'),
  );

  let parts = new Set(processedParts);

  const categories = parts.intersection(ICON_CATEGORIES);
  parts = parts.difference(categories);

  const modifiers = parts.intersection(ICON_MODIFIERS);
  parts = parts.difference(modifiers);

  result.slug = [...parts].join('-').replace(/'/g, '');

  if (modifiers.size > 0) {
    const finalModifiers = new Set<string>();
    modifiers.forEach((m) => {
      if (m === '★') finalModifiers.add('shiny');
      else if (m === '3-ds') finalModifiers.add('n3ds');
      else finalModifiers.add(m);
    });
    result.modifiers = [...finalModifiers];
  }

  if (categories.size > 0) {
    result.categories = [...categories];
  }

  const cssClass = result.slug;
  const cssModifiers = result.modifiers?.join('.');
  result.cssClass = `.pokesprite.pokemon.${cssModifiers ? cssClass + '.' + cssModifiers : cssClass}`;

  return result;
}

function getSpeciesIcons(poke: Species, iconBaseNames: string[]) {
  const iconName = poke.species
    .replace(/Nidoran F/g, 'Nidoran♀')
    .replace(/Nidoran M/g, 'Nidoran♂')
    .replace(/[ \-.:]/g, '')
    .replace(/Flabebe/g, 'Flabébé');

  return iconBaseNames.filter((x) =>
    // Matches pattern followed by space, non-letter, or end of string
    new RegExp(`^${iconName}(?=\\s|[^a-zA-Z]|$)`, 'i').test(x),
  );
}

function sortByKeywords(arr: string[]): string[] {
  return arr.toSorted((a, b) => {
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

main();
