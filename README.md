# Realms Studio

Website for Realms Studio (Realms), built on the Onward Summit template, with
live stats for [Catalog Trending Dance](https://www.roblox.com/games/128646188846151/Catalog-Trending-Dance).

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things are

- `realms-site.tsx`: all the page text (hero, sections, questions, footer).
- `components/realms-live.tsx`: the live game section (players now, visits, favorites, rating, players-over-time graph).
- `app/api/game/route.ts`: reads the numbers from Roblox's public APIs on the server, at most once every 30 seconds.
- `components/realms-connect.tsx`: the "Find us" section (the @iblamematrix handle and a card per platform).
- `app/api/team/route.ts`: looks up the team's Roblox avatars and profile links.
- `lib/realms.ts`: the game, the two CEOs (Matrix and Legal), the username and the social links. Edit this file to change them everywhere.
- `onward-summit-template.tsx`: the uploaded template.

The players-over-time graph starts when the server starts and keeps the last two hours.
