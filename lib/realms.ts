// Realms Studio settings shared by the page and the live stats API.
export const STUDIO = "Realms Studio"

export const GAME = {
  placeId: "128646188846151",
  url: "https://www.roblox.com/games/128646188846151/Catalog-Trending-Dance",
}

/** How often the page asks for fresh numbers, and how long the server reuses them. */
export const REFRESH_MS = 30_000

export type GameStats = {
  universeId: number
  name: string
  description: string
  creator: string
  playing: number
  visits: number
  favorites: number
  maxPlayers: number
  upVotes: number | null
  downVotes: number | null
  icon: string | null
  created: string
  updated: string
  /** Server time of this reading, ms. */
  fetchedAt: number
  /** Player counts the server has seen since it started, oldest first. */
  history: { t: number; playing: number }[]
}
