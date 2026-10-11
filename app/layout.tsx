export const metadata = {
  title: "Realms Studio",
  description: "Realms Studio builds Roblox games. Live player counts and visits for Catalog Trending Dance.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
