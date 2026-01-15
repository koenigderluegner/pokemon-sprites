import fs from 'fs/promises';
import path from 'path';
import { IconMeta, PokemonEntry } from '../shared/types';
import type * as Spritesmith from 'spritesmith';
import spritesmith from 'spritesmith';
import sharp from 'sharp';
import * as layout from 'layout';
import { DATA_JSON_PATH, DOCS_DIR, PREBUILTS_DIR, SPRITES_DIR } from '../shared/constants';

const MAX_WIDTH = 2176;
const USE_CSS_NESTING = true;

interface SpriteItem {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

// taken from https://github.com/msikma/pokesprite-gen/blob/27b51fd5ef340b4ceb82d8102a5d81ac3f994566/packages/lib/spritesmith/layout.js
function placeItemsWithMaxWidth(maxWidth: number) {
  return (items: SpriteItem[]): SpriteItem[] => {
    let x = 0;
    let y = 0;
    let maxHeight = 0;

    items.forEach((item) => {
      if (x + item.width > maxWidth) {
        x = 0;
        y += maxHeight;
        maxHeight = 0;
      }
      item.x = x;
      item.y = y;

      x += item.width;
      maxHeight = Math.max(maxHeight, item.height);
    });

    return items;
  };
}

async function main() {
  try {
    const convertedPokemonEntries = await fs.readFile(DATA_JSON_PATH, {
      encoding: 'utf8',
    });

    const pokemonEntries: PokemonEntry[] = JSON.parse(convertedPokemonEntries);
    const icons: IconMeta[] = pokemonEntries
      .flatMap((entry) => entry.icons.flatMap((icon) => [icon.regular, icon.shiny]))
      .filter((s): s is IconMeta => !!s);

    const sprites = icons.map((s) => path.join(SPRITES_DIR, s.name + '.png'));
    sprites.unshift(path.join(SPRITES_DIR, 'Placeholder.png'));

    layout.addAlgorithm('pokesprite-left-right', {
      sort: (items: any) => items,
      placeItems: placeItemsWithMaxWidth(MAX_WIDTH),
    });

    spritesmith.run(
      {
        src: sprites,
        algorithm:
          'pokesprite-left-right' as Spritesmith.SpritesmithProcessImagesOptions['algorithm'],
      },
      async (err, result) => {
        if (err) {
          console.error('Spritesmith error:', err);
          return;
        }

        const cssContent = generateCss(icons, result.coordinates);
        await saveFiles(result.image, cssContent);
        console.log('Spritesheet generation successful!');
      },
    );
  } catch (error) {
    console.error(
      'Failed to generate spritesheet:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

function generateCss(
  iconMeta: IconMeta[],
  coordinates: Record<string, { x: number; y: number; width: number; height: number }>,
): string {
  let basicStyles = `.pokesprite{display:inline-block}.pokesprite.pokemon{width:68px;height:68px;background-image:url(./spritesheet.png);image-rendering:pixelated;image-rendering:-moz-crisp-edges;`;

  if (!USE_CSS_NESTING) {
    basicStyles += `}`;
  }

  const iconCss = Object.entries(coordinates)
    .map(([iconPath, { x, y }]) => {
      const iconName = path.basename(iconPath, '.png');
      const iconMetaEntry = iconMeta.find((i) => i.name === iconName);
      if (iconMetaEntry) {
        const selector = USE_CSS_NESTING
          ? iconMetaEntry.cssClass.replace('.pokesprite.pokemon', '&')
          : iconMetaEntry.cssClass;
        return `${selector}{background-position:${x === 0 ? x : -x + 'px'} ${y === 0 ? y : -y + 'px'}}`;
      }
      return null;
    })
    .filter((s): s is string => !!s)
    .join('');

  if (USE_CSS_NESTING) {
    return basicStyles + iconCss + `}`;
  } else {
    return basicStyles + iconCss;
  }
}

async function saveFiles(imageBuffer: Buffer, cssContent: string) {
  const png = sharp(imageBuffer).png();

  try {
    await fs.access(PREBUILTS_DIR);
  } catch {
    await fs.mkdir(PREBUILTS_DIR, { recursive: true });
  }

  await Promise.all([
    png.toFile(path.join(DOCS_DIR, 'spritesheet.png')),
    png.toFile(path.join(PREBUILTS_DIR, 'spritesheet.png')),
    fs.writeFile(path.join(DOCS_DIR, 'spritesheet.css'), cssContent, 'utf8'),
    fs.writeFile(path.join(PREBUILTS_DIR, 'spritesheet.css'), cssContent, 'utf8'),
  ]);
}

main();
