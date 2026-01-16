# pokemon-sprites

A collection of Pokémon menu sprites and a prebuilt spritesheet.

## Installation

```bash
bun add pokemon-sprites
```

or with npm:

```bash
npm install pokemon-sprites
```

or with yarn:

```bash
yarn add pokemon-sprites
```

## Contents

This package contains individual Pokémon sprites and prebuilt spritesheet files.

### Sprites

The `sprites/` directory contains thousands of individual Pokémon menu sprites in PNG format. These include regular forms, shiny versions (marked with `★`), and various forms (Mega, Alola, Galar, etc.).

**Path:** `node_modules/pokemon-sprites/sprites/`

### Prebuilts

The `prebuilts/default/` directory contains a generated spritesheet and its corresponding CSS file for easy integration into web projects.

- `spritesheet.png`: A single image containing all sprites.
- `spritesheet.css`: CSS classes for each sprite using `background-position`.

**Path:** `node_modules/pokemon-sprites/prebuilts/default/`

### Data

The `data.json` file contains metadata for all included sprites, including their names, slugs, CSS classes, and available modifiers (like shiny).

**Path:** `node_modules/pokemon-sprites/data.json`

## Usage

### Using individual sprites

You can reference individual sprites directly if your build system supports it:

```html
<img src="node_modules/pokemon-sprites/sprites/Bulbasaur.png" alt="Bulbasaur" />
<img src="node_modules/pokemon-sprites/sprites/Bulbasaur-★.png" alt="Shiny Bulbasaur" />
```

### Using the spritesheet

1. Include the CSS file in your project:

```html
<link rel="stylesheet" href="node_modules/pokemon-sprites/prebuilts/default/spritesheet.css" />
```

2. Use the corresponding CSS classes:

```html
<!-- Generic class for all sprites -->
<i class="pokesprite pokemon bulbasaur"></i>
<i class="pokesprite pokemon bulbasaur shiny"></i>
```

For a detailed list, see the [prebuilt spritesheet documentation](https://koenig.gg/pokemon-sprites/).

## License

The sprite images are © Nintendo/Creatures Inc./GAME FREAK Inc.
Various artists made custom icons and colorings, see the [credits](https://koenig.gg/pokemon-sprites/#credits) for more information.
The code and packaging are licensed under the [MIT License](https://opensource.org/license/MIT).
