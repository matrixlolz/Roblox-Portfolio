// Realms Studio settings shared by the page and the APIs. Edit here to change
// the game, the team or the social links everywhere at once.
export const STUDIO = "Realms Studio"

export const GAME = {
  placeId: "128646188846151",
  url: "https://www.roblox.com/games/128646188846151/Catalog-Trending-Dance",
}

/** How often the page asks for fresh numbers, and how long the server reuses them. */
export const REFRESH_MS = 30_000

export type TeamMember = {
  name: string
  role: string
  bio: string
  /** Roblox username. The site shows this account's avatar and links its profile. */
  roblox?: string
}

export const TEAM: TeamMember[] = [
  { name: "Matrix", role: "Co-founder & CEO", roblox: "iblamematrix", bio: "Leads Realms and Catalog Trending Dance, from the next update to the long-term plan." },
  { name: "Legal", role: "Co-founder & CEO", bio: "Runs Realms alongside Matrix, keeping the studio, its partners and its players moving forward." },
]

/** The username Realms uses on every platform. */
export const HANDLE = "iblamematrix"

export type Social = {
  platform: "Discord" | "Roblox" | "YouTube" | "TikTok" | "X" | "Instagram"
  /** Discord has no public profile URL, so it gets a copy button instead. */
  href?: string
  action: string
}

export const SOCIALS: Social[] = [
  { platform: "Discord", action: "Copy username" },
  { platform: "Roblox", href: `https://www.roblox.com/search/users?keyword=${HANDLE}`, action: "View profile" },
  { platform: "YouTube", href: `https://www.youtube.com/@${HANDLE}`, action: "Watch" },
  { platform: "TikTok", href: `https://www.tiktok.com/@${HANDLE}`, action: "Follow" },
  { platform: "X", href: `https://x.com/${HANDLE}`, action: "Follow" },
  { platform: "Instagram", href: `https://www.instagram.com/${HANDLE}`, action: "Follow" },
]

export type GameStats = {
  universeId: number
  name: string
  description: string
  creator: string
  genre: string
  playing: number
  visits: number
  favorites: number
  maxPlayers: number
  upVotes: number | null
  downVotes: number | null
  icon: string | null
  /** The game's screenshots on Roblox. */
  screenshots: string[]
  created: string
  updated: string
  /** Server time of this reading, ms. */
  fetchedAt: number
  /** Player counts the server has seen since it started, oldest first. */
  history: { t: number; playing: number }[]
}

export type RobloxPerson = { username: string; userId: number; displayName: string; headshot: string | null; profile: string }
