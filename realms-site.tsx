"use client"

import OnwardSummitTemplate from "@/components/ui/onward-summit-template"
import { LiveDot, RealmsLive, fmtFull, useGameStats } from "@/components/realms-live"
import { RealmsConnect, personFor, useTeam } from "@/components/realms-connect"
import { GAME, HANDLE, STUDIO, TEAM } from "@/lib/realms"

// The Realms Studio site: the uploaded template with Realms content, plus a
// live stats section for the studio's game and a "Find us" section.
export default function RealmsSite() {
  const live = useGameStats()
  const people = useTeam()
  const playing = live.stats ? `${fmtFull(live.stats.playing)} playing` : live.error ? "Live stats" : "Connecting…"

  return (
    <OnwardSummitTemplate
      end={<RealmsConnect people={people} />}
      brand="realms"
      title="Realms"
      tagline={"Realms Studio builds Roblox worlds\npeople keep coming back to"}
      register={{ label: "Play our game", href: GAME.url }}
      when={{
        left: STUDIO,
        right: (
          <>
            <LiveDot />
            {playing}
          </>
        ),
        href: "#live",
        title: "See live game stats",
      }}
      expect={{
        title: "What Realms builds",
        intro: "We're a Roblox studio that makes social games built around showing off, dancing and hanging out with friends.",
        features: [
          { icon: "arrow", title: "Games that trend", text: "Catalog Trending Dance puts the outfits and emotes everyone is talking about on one stage." },
          { icon: "ring", title: "Updates that keep coming", text: "New dances, items and events ship often, so there's always a reason to come back." },
          { icon: "plus", title: "Built to last", text: "Clean Luau, saved progress and server-side checks, so the game stays fast and fair as it grows." },
        ],
      }}
      guests={{
        title: "Who we build for",
        audiences: [
          { role: "Players", pitch: "You want somewhere to show off your fit, learn the newest dances and meet people doing the same. Jump into Catalog Trending Dance and join the crowd." },
          { role: "Creators", pitch: "You make UGC items and emotes. Our game is where players try on what's trending, so it's where your work gets seen." },
          { role: "Brands", pitch: "You want to reach Roblox players where they already hang out. Talk to us about events and items inside a game people visit every day." },
          { role: "Developers", pitch: "You build on Roblox too. Follow how Realms ships, grows and keeps a live game running, and say hi if you want to work together." },
        ],
      }}
      agenda={null}
      speakers={{
        title: "The people behind Realms",
        intro: `Realms Studio is run by two CEOs, ${TEAM.map((m) => m.name).join(" and ")}. Hover a card to read more.`,
        people: TEAM.map((m) => {
          const roblox = personFor(people, m.roblox)
          return { name: m.name, role: m.role, company: m.roblox ? "@" + m.roblox : undefined, bio: m.bio, photo: roblox?.headshot ?? undefined }
        }),
      }}
      venue={null}
      cta={null}
      faq={{
        title: "Questions",
        items: [
          { q: "What is Realms Studio?", a: "Realms Studio, or just Realms, is a team making games on Roblox. Our first game is Catalog Trending Dance." },
          { q: "Is the game free?", a: "Yes. Catalog Trending Dance is free to play on Roblox, on phone, tablet, computer, console and VR." },
          { q: "Are the player numbers real?", a: "Yes. They come straight from Roblox and refresh every 30 seconds while this page is open." },
          { q: "Who runs Realms?", a: `Two CEOs: ${TEAM.map((m) => m.name).join(" and ")}. They lead the studio together, from game updates to partnerships.` },
          { q: "How do I contact Realms?", a: `Message @${HANDLE} on Discord, Roblox, YouTube, TikTok, X or Instagram. It's the same username everywhere.` },
          { q: "Can we work with you?", a: `Yes. Creators, brands and developers can message @${HANDLE} about collaborations, events and UGC.` },
          { q: "How often is the game updated?", a: "Regularly. The \"Last updated\" date in the live section above comes straight from Roblox, so it's always current." },
          { q: "Where do the screenshots come from?", a: "They're pulled live from the game's Roblox page, so new ones show up here on their own." },
        ],
      }}
      footer={{
        links: [
          { label: "Live stats", href: "#live" },
          { label: "What we build", href: "#expect" },
          { label: "Team", href: "#speakers" },
          { label: "Questions", href: "#faq" },
          { label: "Find us", href: "#connect" },
          { label: "Play on Roblox", href: GAME.url },
        ],
        note: `© ${new Date().getFullYear()} Realms Studio. Not affiliated with Roblox Corporation.`,
      }}
    >
      <RealmsLive live={live} />
    </OnwardSummitTemplate>
  )
}
