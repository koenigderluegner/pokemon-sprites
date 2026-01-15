export interface IconMeta {
  name: string;
  slug: string;
  cssClass: string;
  categories?: string[];
  modifiers?: string[];
}

export interface PokemonIconPair {
  regular: IconMeta;
  shiny: IconMeta | null;
}

export interface PokemonEntry {
  id: number;
  species: string;
  icons: PokemonIconPair[];
}

export interface Species {
  species: string;
  id: number;
}
