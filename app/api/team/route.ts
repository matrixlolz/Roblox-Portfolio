import { NextResponse } from "next/server"
import { TEAM, type RobloxPerson } from "@/lib/realms"

// Roblox avatars and profile links for the team members who have a Roblox
// username in lib/realms.ts. Avatars change rarely, so one lookup an hour.

export const dynamic = "force-dynamic"

const TTL_MS = 60 * 60 * 1000
let cached: { at: number; people: RobloxPerson[] } | null = null

async function load(): Promise<RobloxPerson[]> {
  const usernames = TEAM.map((m) => m.roblox).filter((u): u is string => !!u)
  if (!usernames.length) return []
  const res = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ usernames, excludeBannedUsers: true }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`users.roblox.com answered ${res.status}`)
  const users: { requestedUsername: string; id: number; displayName: string }[] = (await res.json())?.data ?? []
  if (!users.length) return []

  const shots = await fetch(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${users.map((u) => u.id).join(",")}&size=420x420&format=Png&isCircular=false`,
    { cache: "no-store", signal: AbortSignal.timeout(8000) },
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
  const byId = new Map<number, string>()
  for (const t of shots?.data ?? []) if (t.state === "Completed" && t.imageUrl) byId.set(t.targetId, t.imageUrl)

  return users.map((u) => ({
    username: u.requestedUsername,
    userId: u.id,
    displayName: u.displayName,
    headshot: byId.get(u.id) ?? null,
    profile: `https://www.roblox.com/users/${u.id}/profile`,
  }))
}

export async function GET() {
  if (cached && Date.now() - cached.at < TTL_MS) return NextResponse.json(cached.people)
  try {
    const people = await load()
    cached = { at: Date.now(), people }
    return NextResponse.json(people)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not reach Roblox" }, { status: 502 })
  }
}
