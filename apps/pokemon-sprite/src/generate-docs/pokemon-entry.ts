export type PokemonIconPair = {
  regular: IconMeta,
  shiny: IconMeta | null
}

export type IconMeta = {
  name: string;
  slug: string;
  categories?: string[];
  modifiers?: string[]
}

export type PokemonEntry = { id: number; species: string; icons: PokemonIconPair[] }
