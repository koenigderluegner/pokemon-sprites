export type PokemonIconPair = {
  regular: string,
  shiny: string | null
}

export type PokemonEntry = { id: number; species: string; icons: PokemonIconPair[] }
