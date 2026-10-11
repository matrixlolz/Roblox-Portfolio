"use client"

import * as React from "react"
import { GAME, REFRESH_MS, type GameStats } from "@/lib/realms"

// The live game section. It sits inside the template, so it borrows the
// template's colours (--ows-*), type and buttons, and adds only its own layout.

export type LiveState = { stats: GameStats | null; error: string | null; refreshing: boolean; refresh: () => void }

/** Polls /api/game every REFRESH_MS while the tab is visible. */
export function useGameStats(): LiveState {
  const [stats, setStats] = React.useState<GameStats | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)

  const refresh = React.useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/game", { cache: "no-store" })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || "Could not reach Roblox")
      setStats(body)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach Roblox")
    } finally {
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh()
    }, REFRESH_MS)
    const onVisible = () => document.visibilityState === "visible" && refresh()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [refresh])

  return { stats, error, refreshing, refresh }
}

const full = new Intl.NumberFormat("en-US")
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

export function fmtFull(n: number) {
  return full.format(Math.round(n))
}

export function fmtCompact(n: number) {
  return n < 10_000 ? full.format(n) : compact.format(n)
}

/** Counts from the last value to the new one instead of jumping. */
function useTween(target: number | null, ms = 900) {
  const [v, setV] = React.useState(target ?? 0)
  const from = React.useRef(target ?? 0)
  React.useEffect(() => {
    if (target === null) return
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const start = from.current
    if (reduce || start === target) {
      from.current = target
      setV(target)
      return
    }
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      const e = 1 - Math.pow(1 - k, 3)
      const cur = start + (target - start) * e
      from.current = cur
      setV(cur)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

function useNow(every = 1000) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(id)
  }, [every])
  return now
}

function ago(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 5) return "just now"
  if (s < 60) return `${s}s ago`
  return `${Math.round(s / 60)}m ago`
}

function timeOf(t: number) {
  return new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function LiveDot() {
  return <span className="rlm-dot" aria-hidden="true" />
}

function Stat({ label, value, title, hint }: { label: string; value: React.ReactNode; title?: string; hint?: React.ReactNode }) {
  return (
    <div className="rlm-stat" title={title}>
      <span className="rlm-stat-label">{label}</span>
      <span className="rlm-stat-value">{value}</span>
      {hint && <span className="rlm-stat-hint">{hint}</span>}
    </div>
  )
}

// ---- players over time ------------------------------------------------------
function PlayersChart({ points }: { points: { t: number; playing: number }[] }) {
  const W = 640
  const H = 160
  const PAD_T = 12
  const PAD_B = 22
  const [hover, setHover] = React.useState<number | null>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  if (points.length < 2) {
    return (
      <div className="rlm-chart rlm-chart--empty">
        <p>The graph fills in as readings come in, one every 30 seconds.</p>
      </div>
    )
  }

  const t0 = points[0].t
  const t1 = points[points.length - 1].t
  const max = Math.max(...points.map((p) => p.playing))
  const top = max <= 0 ? 1 : Math.ceil((max * 1.15) / niceStep(max)) * niceStep(max)
  const x = (t: number) => (t1 === t0 ? 0 : ((t - t0) / (t1 - t0)) * W)
  const y = (v: number) => PAD_T + (1 - v / top) * (H - PAD_T - PAD_B)
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.playing).toFixed(1)}`).join("")
  const area = `${line}L${W},${H - PAD_B}L0,${H - PAD_B}Z`
  const h = hover === null ? null : points[hover]

  const onMove = (e: React.PointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect()
    if (!box) return
    const tx = t0 + ((e.clientX - box.left) / box.width) * (t1 - t0)
    let best = 0
    for (let i = 1; i < points.length; i++) if (Math.abs(points[i].t - tx) < Math.abs(points[best].t - tx)) best = i
    setHover(best)
  }

  return (
    <div className="rlm-chart" ref={wrapRef} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Players over time, from ${timeOf(t0)} to ${timeOf(t1)}. Peak ${fmtFull(max)}.`}>
        <defs>
          <linearGradient id="rlm-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--ows-mid)" stopOpacity=".18" />
            <stop offset="1" stopColor="var(--ows-mid)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.5, 1].map((k) => (
          <line key={k} x1="0" x2={W} y1={y(top * k)} y2={y(top * k)} className="rlm-grid" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" x2={W} y1={H - PAD_B} y2={H - PAD_B} className="rlm-axis" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="url(#rlm-area)" />
        <path d={line} className="rlm-line" vectorEffect="non-scaling-stroke" />
        {h && <line x1={x(h.t)} x2={x(h.t)} y1={PAD_T} y2={H - PAD_B} className="rlm-cross" vectorEffect="non-scaling-stroke" />}
      </svg>
      <span className="rlm-tick rlm-tick--y" style={{ top: `${(y(top) / H) * 100}%` }}>{fmtCompact(top)}</span>
      <span className="rlm-tick rlm-tick--l">{timeOf(t0)}</span>
      <span className="rlm-tick rlm-tick--r">{timeOf(t1)}</span>
      {h && (
        <>
          <span className="rlm-marker" style={{ left: `${(x(h.t) / W) * 100}%`, top: `${(y(h.playing) / H) * 100}%` }} />
          <div className="rlm-tip" style={{ left: `${(x(h.t) / W) * 100}%` }} data-flip={x(h.t) > W * 0.7 ? "" : undefined}>
            <strong>{fmtFull(h.playing)}</strong> playing
            <span>{timeOf(h.t)}</span>
          </div>
        </>
      )}
    </div>
  )
}

function niceStep(max: number) {
  const raw = max / 2
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))))
  const n = raw / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

// ---- the section --------------------------------------------------------------
export function RealmsLive({ live }: { live: LiveState }) {
  const { stats, error, refreshing, refresh } = live
  const now = useNow()
  const playing = useTween(stats ? stats.playing : null)
  const votes = stats && stats.upVotes !== null && stats.downVotes !== null ? stats.upVotes + stats.downVotes : 0
  const rating = stats && votes ? Math.round(((stats.upVotes ?? 0) / votes) * 100) : null
  const peak = stats?.history.length ? Math.max(...stats.history.map((p) => p.playing)) : null

  return (
    <section id="live" data-sec="live" className="ows-sec ows-wrap rlm-live" aria-label="Live game stats">
      <style>{RLM_CSS}</style>
      <div className="ows-sec-head">
        <div>
          <span className="ows-kicker">
            <LiveDot /> Live from Roblox
          </span>
          <h2 className="ows-h2 rlm-h2">Our game, right now</h2>
          <p className="ows-intro">Real numbers straight from Roblox, refreshed every 30 seconds. Hover a number to see it in full.</p>
        </div>
        <a className="ows-btn ows-btn--accent" href={GAME.url} target="_blank" rel="noreferrer">
          Play on Roblox <PlayGlyph />
        </a>
      </div>

      <div className="rlm-card" aria-busy={!stats && !error}>
        <div className="rlm-game">
          {stats?.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="rlm-icon" src={stats.icon} alt="" width={96} height={96} />
          ) : (
            <span className="rlm-icon rlm-icon--blank" aria-hidden="true" />
          )}
          <div className="rlm-game-meta">
            <a className="rlm-game-name" href={GAME.url} target="_blank" rel="noreferrer">
              {stats?.name ?? "Catalog Trending Dance"}
            </a>
            {stats?.creator && <span className="rlm-game-by">by {stats.creator}</span>}
            <span className="rlm-status" aria-live="polite">
              {error && !stats ? (
                <>Live stats are unavailable right now.</>
              ) : stats ? (
                <>
                  <LiveDot /> Updated {ago(now - stats.fetchedAt)}
                  {error && " · last refresh failed"}
                </>
              ) : (
                <>Connecting to Roblox…</>
              )}
            </span>
          </div>
          <button type="button" className="ows-btn ows-btn--dark ows-btn--sm rlm-refresh" onClick={refresh} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && !stats ? (
          <div className="rlm-error" role="alert">
            <p>
              We couldn&apos;t reach Roblox ({error}). The numbers will appear as soon as it answers.
            </p>
          </div>
        ) : (
          <>
            <div className="rlm-stats">
              <Stat
                label="Playing now"
                value={stats ? fmtFull(playing) : "—"}
                hint={stats && stats.maxPlayers ? `${fmtFull(stats.maxPlayers)} per server` : undefined}
              />
              <Stat label="Total visits" value={stats ? fmtCompact(stats.visits) : "—"} title={stats ? fmtFull(stats.visits) + " visits" : undefined} />
              <Stat label="Favorites" value={stats ? fmtCompact(stats.favorites) : "—"} title={stats ? fmtFull(stats.favorites) + " favorites" : undefined} />
              <Stat
                label="Rating"
                value={rating !== null ? `${rating}%` : "—"}
                hint={votes ? `${fmtCompact(votes)} votes` : undefined}
              />
            </div>
            <div className="rlm-chart-head">
              <span className="rlm-chart-title">Players over time</span>
              {peak !== null && <span className="rlm-chart-sub">Peak {fmtFull(peak)} since tracking started</span>}
            </div>
            <PlayersChart points={stats?.history ?? []} />
          </>
        )}
      </div>
    </section>
  )
}

function PlayGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 1.2v7.6L8.6 5z" fill="currentColor" />
    </svg>
  )
}

const RLM_CSS = `
.rlm-h2{margin-top:10px}
.rlm-dot{display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,.55);animation:rlm-pulse 2s infinite;vertical-align:1px}
@keyframes rlm-pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)}70%{box-shadow:0 0 0 7px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
@media (prefers-reduced-motion:reduce){.rlm-dot{animation:none}}
.rlm-card{margin-top:clamp(32px,4vw,48px);border:1px solid color-mix(in srgb,var(--ows-ink) 10%,transparent);border-radius:14px;padding:clamp(18px,3vw,32px);background:linear-gradient(180deg,var(--ows-tint),var(--ows-paper) 60%)}
.rlm-game{display:flex;align-items:center;gap:18px}
.rlm-icon{width:72px;height:72px;border-radius:14px;object-fit:cover;flex:none;box-shadow:0 8px 24px -12px color-mix(in srgb,var(--ows-deep) 60%,transparent)}
.rlm-icon--blank{display:block;background:linear-gradient(135deg,var(--ows-icon-a),var(--ows-icon-b))}
.rlm-game-meta{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.rlm-game-name{font-size:19px;font-weight:550;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rlm-game-name:hover{color:var(--ows-mid)}
.rlm-game-by{font-size:13.5px;color:var(--ows-muted)}
.rlm-status{font-size:12.5px;color:var(--ows-muted);margin-top:2px}
.rlm-refresh{flex:none}
.rlm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin-top:clamp(22px,3vw,32px);background:color-mix(in srgb,var(--ows-ink) 9%,transparent);border-radius:10px;overflow:hidden}
.rlm-stat{display:flex;flex-direction:column;gap:4px;padding:18px 18px 16px;background:var(--ows-paper)}
.rlm-stat-label{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ows-muted)}
.rlm-stat-value{font-size:clamp(28px,3.4vw,40px);font-weight:500;letter-spacing:-.04em;line-height:1.05;font-variant-numeric:tabular-nums;color:var(--ows-ink)}
.rlm-stat:first-child .rlm-stat-value{color:var(--ows-mid)}
.rlm-stat-hint{font-size:12.5px;color:var(--ows-muted)}
.rlm-chart-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-top:clamp(24px,3vw,34px)}
.rlm-chart-title{font-size:15px;font-weight:500}
.rlm-chart-sub{font-size:12.5px;color:var(--ows-muted)}
.rlm-chart{position:relative;height:180px;margin-top:10px;touch-action:pan-y}
.rlm-chart svg{display:block;width:100%;height:100%;overflow:visible}
.rlm-chart--empty{display:flex;align-items:center;justify-content:center;border:1px dashed color-mix(in srgb,var(--ows-ink) 15%,transparent);border-radius:10px;font-size:13.5px;color:var(--ows-muted);text-align:center;padding:0 16px}
.rlm-grid{stroke:color-mix(in srgb,var(--ows-ink) 8%,transparent);stroke-width:1;stroke-dasharray:3 4}
.rlm-axis{stroke:color-mix(in srgb,var(--ows-ink) 18%,transparent);stroke-width:1}
.rlm-line{fill:none;stroke:var(--ows-mid);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.rlm-cross{stroke:color-mix(in srgb,var(--ows-ink) 35%,transparent);stroke-width:1}
.rlm-tick{position:absolute;font-size:11.5px;color:var(--ows-muted);font-variant-numeric:tabular-nums;pointer-events:none}
.rlm-tick--y{left:0;transform:translateY(-120%)}
.rlm-tick--l{left:0;bottom:0}
.rlm-tick--r{right:0;bottom:0}
.rlm-marker{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:var(--ows-mid);box-shadow:0 0 0 2px var(--ows-paper);pointer-events:none}
.rlm-tip{position:absolute;top:-6px;transform:translate(10px,-100%);display:flex;flex-direction:column;gap:1px;padding:7px 10px;border-radius:7px;background:var(--ows-ink);color:var(--ows-paper);font-size:12.5px;white-space:nowrap;pointer-events:none}
.rlm-tip[data-flip]{transform:translate(calc(-100% - 10px),-100%)}
.rlm-tip strong{font-weight:600;font-variant-numeric:tabular-nums}
.rlm-tip span{opacity:.7;font-size:11.5px}
.rlm-error{margin-top:24px;padding:18px;border-radius:10px;background:var(--ows-paper);border:1px solid color-mix(in srgb,var(--ows-ink) 10%,transparent);font-size:14px;color:var(--ows-muted)}
@media (max-width:760px){
  .rlm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .rlm-game{flex-wrap:wrap}
  .rlm-icon{width:60px;height:60px}
  .rlm-refresh{width:100%}
}
`
