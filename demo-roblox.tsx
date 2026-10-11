"use client"

import OnwardSummitTemplate from "@/components/ui/onward-summit-template"

// The template, untouched, filled with Roblox content through its props.
export default function DemoRoblox() {
  return (
    <OnwardSummitTemplate
      brand="blox"
      title="Roblox Showcase"
      tagline={"A day of games, scripts and\nsystems built in Roblox Studio"}
      date="December 5, 2026"
      city="Online"
      startsAt="2026-12-05T10:00:00-05:00"
      register={{ label: "Join the showcase" }}
      expect={{
        title: "What you'll see",
        intro: "A live walkthrough of the games and systems I've built in Roblox Studio with Luau, from first prototype to published experience.",
        features: [
          { icon: "arrow", title: "Gameplay scripting", text: "Combat, obbies, simulators and round systems written in clean, modular Luau." },
          { icon: "ring", title: "Saved progress", text: "DataStores and session locking so player data never gets lost." },
          { icon: "plus", title: "Secure networking", text: "RemoteEvents with server-side checks that keep exploiters out." },
        ],
      }}
      guests={{
        title: "Who it's for",
        audiences: [
          { role: "Game owners", pitch: "You have the idea and the community. See how a scripter turns a design doc into a game that holds players and earns Robux." },
          { role: "Studios", pitch: "You need someone who slots into a team. See how I structure ModuleScripts, use Rojo and Git, and hand off code others can read." },
          { role: "Players", pitch: "You play the games. Get a look behind the scenes at how your favourite mechanics are actually built." },
          { role: "New developers", pitch: "You're learning Luau. Pick up the patterns, tools and habits that took me from free models to published games." },
        ],
      }}
      agenda={{
        title: "The day",
        sessions: [
          { start: "10:00", duration: 30, title: "Welcome and portfolio tour", speakers: ["You"], track: "Keynote", description: "Who I am, what I build and the games we'll dig into today." },
          { start: "10:45", duration: 60, title: "Building a simulator from scratch", speakers: ["You"], track: "Workshop", description: "Pets, rebirths, leaderstats and a gamepass shop, scripted live in Studio." },
          { start: "12:00", duration: 45, title: "Combat systems that feel good", speakers: ["You"], track: "Demo", description: "Hitboxes, combos and server validation without the lag." },
          { start: "13:00", duration: 45, title: "Lunch break", track: "Breaks" },
          { start: "14:00", duration: 50, title: "DataStores done right", speakers: ["You"], track: "Workshop", description: "Saving player data safely with retries, session locks and backups." },
          { start: "15:15", duration: 45, title: "Live Q&A and commission chat", speakers: ["You"], track: "Panel" },
        ],
      }}
      speakers={{
        title: "Featured games",
        intro: "Experiences I've scripted and shipped on Roblox.",
        people: [
          { name: "Obby Rush", role: "Lead Scripter", company: "10K+ visits", bio: "Checkpoints, timers, leaderboards and a gamepass shop." },
          { name: "Pet Sim Lite", role: "Scripter", company: "5K+ visits", bio: "Pets, eggs, rebirths and saved progress with DataStores." },
          { name: "Blade Arena", role: "Systems Developer", company: "Commission", bio: "Melee combat with combos and server-side hit validation." },
          { name: "Tycoon Kit", role: "Scripter", company: "Open source", bio: "A reusable tycoon framework built from ModuleScripts." },
        ],
      }}
      venue={{
        title: "Where",
        name: "Roblox",
        address: "Live in my Roblox experience",
        city: "and on Discord",
        notes: ["Join from any device", "Free to attend", "Bring your questions"],
        mapHref: "https://www.roblox.com",
      }}
      faq={{
        title: "Questions",
        items: [
          { q: "Do you take commissions?", a: "Yes. Scripting, systems and full games. Payment in Robux or USD." },
          { q: "What tools do you use?", a: "Roblox Studio, Luau, Rojo, Git and VS Code." },
          { q: "Can I play the games?", a: "Yes, every featured game is public on Roblox." },
          { q: "How do I contact you?", a: "Message me on Discord or through my Roblox profile." },
        ],
      }}
      cta={{ kicker: "Spots", title: "Save your spot", subtitle: "The showcase server holds a limited number of players.", seats: { total: 50, taken: 31 } }}
      footer={{ note: "© 2026 Roblox Dev Showcase. Not affiliated with Roblox Corporation." }}
      onRegister={async (data) => {
        console.log("registered", data)
        await new Promise((r) => setTimeout(r, 700))
      }}
    />
  )
}
