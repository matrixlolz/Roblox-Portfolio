import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Realms Studio",
  description: "Realms Studio builds Roblox games. Live player counts, visits and screenshots for Catalog Trending Dance, run by Matrix and Legal.",
  openGraph: {
    title: "Realms Studio",
    description: "Roblox worlds people keep coming back to. See who's playing Catalog Trending Dance right now.",
    type: "website",
  },
  twitter: { card: "summary", title: "Realms Studio", creator: "@iblamematrix" },
}

export const viewport: Viewport = { themeColor: "#06174a" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
