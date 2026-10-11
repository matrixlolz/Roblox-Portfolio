import { NextResponse } from "next/server"
import { GAME, REFRESH_MS, type GameStats } from "@/lib/realms"

// Live numbers for the Realms game, read from Roblox's public web APIs on the
// server (they don't allow browser requests from other sites).

export const dynamic = "force-dynamic"

const HISTORY_MAX = 240 // two hours at one reading every 30 seconds

let universeId: number | null = null
let cached: GameStats | null = null
let inflight: Promise<GameStats> | null = null
const history: { t: number; playing: number }[] = []

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`${new URL(url).host} answered ${res.status}`)
  return res.json()
}

async function load(): Promise<GameStats> {
  let id = universeId
  if (id === null) {
    const u = await getJson(`https://apis.roblox.com/universes/v1/places/${GAME.placeId}/universe`)
    if (typeof u?.universeId !== "number") throw new Error("Roblox returned no universe for this place")
    id = universeId = u.universeId as number
  }
  const [games, votes, icons] = await Promise.all([
    getJson(`https://games.roblox.com/v1/games?universeIds=${id}`),
    getJson(`https://games.roblox.com/v1/games/votes?universeIds=${id}`).catch(() => null),
    getJson(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${id}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`).catch(() => null),
  ])
  const g = games?.data?.[0]
  if (!g) throw new Error("Roblox returned no data for this game")
  const v = votes?.data?.[0]
  const icon = icons?.data?.[0]

  const now = Date.now()
  history.push({ t: now, playing: g.playing ?? 0 })
  if (history.length > HISTORY_MAX) history.splice(0, history.length - HISTORY_MAX)

  return {
    universeId: id,
    name: g.name,
    description: g.description ?? "",
    creator: g.creator?.name ?? "",
    playing: g.playing ?? 0,
    visits: g.visits ?? 0,
    favorites: g.favoritedCount ?? 0,
    maxPlayers: g.maxPlayers ?? 0,
    upVotes: typeof v?.upVotes === "number" ? v.upVotes : null,
    downVotes: typeof v?.downVotes === "number" ? v.downVotes : null,
    icon: icon?.state === "Completed" && icon.imageUrl ? icon.imageUrl : null,
    created: g.created,
    updated: g.updated,
    fetchedAt: now,
    history: history.slice(),
  }
}

export async function GET() {
  // Every visitor shares one reading per refresh window, so Roblox sees at
  // most one request per 30 seconds however many people have the page open.
  if (cached && Date.now() - cached.fetchedAt < REFRESH_MS - 1000) return NextResponse.json(cached)
  try {
    inflight ??= load().finally(() => {
      inflight = null
    })
    cached = await inflight
    return NextResponse.json(cached)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reach Roblox"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
