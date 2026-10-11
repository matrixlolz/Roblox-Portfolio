"use client"

import * as React from "react"
import { HANDLE, SOCIALS, TEAM, type RobloxPerson, type Social } from "@/lib/realms"
import { useCopy } from "@/components/realms-live"

// "Find us": the one handle Realms uses everywhere, and a card per platform.
// Like the live section it lives inside the template and uses its colours.

/** Roblox accounts for the team, looked up once. Empty until (or unless) Roblox answers. */
export function useTeam() {
  const [people, setPeople] = React.useState<RobloxPerson[]>([])
  React.useEffect(() => {
    let alive = true
    fetch("/api/team")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => alive && Array.isArray(d) && setPeople(d))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return people
}

export function personFor(people: RobloxPerson[], username?: string) {
  if (!username) return undefined
  return people.find((p) => p.username.toLowerCase() === username.toLowerCase())
}

function SocialCard({ s, href }: { s: Social; href?: string }) {
  const { copied, copy } = useCopy()
  const body = (
    <>
      <span className="rlm-soc-mark" aria-hidden="true">
        {s.platform === "X" ? "𝕏" : s.platform[0]}
      </span>
      <span className="rlm-soc-text">
        <span className="rlm-soc-platform">{s.platform}</span>
        <span className="rlm-soc-handle">@{HANDLE}</span>
      </span>
      <span className="rlm-soc-action">{copied ? "Copied!" : s.action}</span>
    </>
  )
  if (!href) {
    return (
      <button type="button" className="rlm-soc" onClick={() => copy(HANDLE)} aria-label={`Copy ${s.platform} username ${HANDLE}`}>
        {body}
      </button>
    )
  }
  return (
    <a className="rlm-soc" href={href} target="_blank" rel="noreferrer">
      {body}
    </a>
  )
}

export function RealmsConnect({ people }: { people: RobloxPerson[] }) {
  const { copied, copy } = useCopy()
  const matrix = personFor(people, HANDLE)
  const ceos = TEAM.map((m) => m.name).join(" and ")

  return (
    <section id="connect" data-sec="connect" className="ows-sec ows-wrap rlm-connect" aria-labelledby="rlm-connect-title">
      <style>{CONNECT_CSS}</style>
      <span className="ows-kicker">One name, everywhere</span>
      <h2 id="rlm-connect-title" className="ows-h2 rlm-h2">Find us</h2>
      <p className="ows-intro">
        Want to work with Realms, partner on an event or just say hi? Message {ceos} as <strong>@{HANDLE}</strong> on any platform below.
      </p>

      <div className="rlm-handle">
        <span className="rlm-handle-at">@{HANDLE}</span>
        <button type="button" className="ows-btn ows-btn--accent" onClick={() => copy(HANDLE)}>
          {copied ? "Copied!" : "Copy username"}
        </button>
      </div>

      <ul className="rlm-socs">
        {SOCIALS.map((s) => (
          <li key={s.platform}>
            <SocialCard s={s} href={s.platform === "Roblox" && matrix ? matrix.profile : s.href} />
          </li>
        ))}
      </ul>
    </section>
  )
}

const CONNECT_CSS = `
.rlm-connect strong{color:var(--ows-ink);font-weight:550}
.rlm-handle{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-top:clamp(28px,4vw,40px);padding:clamp(20px,3vw,32px);border-radius:14px;background:linear-gradient(120deg,var(--ows-deep),var(--ows-mid));color:#fff}
.rlm-handle-at{font-size:clamp(30px,5.4vw,64px);font-weight:500;letter-spacing:-.045em;line-height:1;overflow-wrap:anywhere}
.rlm-socs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}
.rlm-soc{display:flex;align-items:center;gap:14px;width:100%;height:100%;box-sizing:border-box;padding:16px 18px;border-radius:12px;border:1px solid color-mix(in srgb,var(--ows-ink) 10%,transparent);background:var(--ows-paper);transition:border-color .25s,transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.rlm-soc:hover{border-color:var(--ows-mid);transform:translateY(-2px);box-shadow:0 14px 30px -18px color-mix(in srgb,var(--ows-deep) 70%,transparent)}
.rlm-soc-mark{display:flex;align-items:center;justify-content:center;flex:none;width:40px;height:40px;border-radius:10px;background:var(--ows-tint);color:var(--ows-mid);font-weight:600;font-size:17px}
.rlm-soc:hover .rlm-soc-mark{background:var(--ows-mid);color:#fff}
.rlm-soc-text{display:flex;flex-direction:column;min-width:0;flex:1}
.rlm-soc-platform{font-size:15px;font-weight:500}
.rlm-soc-handle{font-size:13px;color:var(--ows-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rlm-soc-action{flex:none;font-size:12.5px;font-weight:500;color:var(--ows-mid)}
@media (max-width:900px){.rlm-socs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.rlm-socs{grid-template-columns:1fr}}
`
