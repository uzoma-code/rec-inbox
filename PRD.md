# PRD — Rec Inbox

**Author:** Uzoma  ·  **Date:** 2026-09-29  ·  **Version:** 0.1

> **One-liner (Maya’s test):** The inbox for movies your friends told you to watch—not a public log of everything you’ve seen.

---

## 1. Product Summary
*What is it, who is it for, and what does it help them do?*

- **One-liner:** For the friend-group backlog keeper who loses recs in chat and Notes, **Rec Inbox** is a private watch queue that stores **title + who recommended it + when**, lets her mark it watched and rate 1–5 stars, puts **only 5★** titles on **Your Favorites**, and uses those 5★ titles to suggest **similar** movies/shows.
- **TL;DR:** Maya adds a movie or show the moment a friend recs it—in about **10 seconds**. Rec Inbox is her single **to-watch** list (not Netflix My List, not Letterboxd). Each row shows **who** rec’d it and **how long it’s been waiting**. When she finishes, she marks it **watched** and rates it out of **5 stars**. **Your Favorites** shows only titles rated **5**. A separate **Possible New Faves** screen recommends similar titles based **only** on those 5★ watched recs. She can sign in so the list follows her across devices, and each title can show **where to stream**. Success is not a big library—it is that she **closes the loop**: watched + rated, instead of another dead Notes list.

## 2. Target Customer  *(Lean Product Process: Target Customer)*
*Describe the person. Separate the **buyer / relationship owner** from the **user** if they differ.*

- **User:** Maya Okonkwo, 28, remote marketing manager at a mid-size SaaS company (campaigns, Slack all day, async with a distributed team). Lives alone in Austin, TX; most close friends live in other cities. Streams most nights after work. Default “list keeper” in **“The Watchlist”**—a 6-person WhatsApp group from college that swaps recs constantly, roasts bad picks, and occasionally does synced watch nights on Discord. The group drops **2+ movie/show recs per week**.
- **Buyer / decision-maker (if different):** Same person—she installs and uses it for herself.
- **Top 3–5 defining attributes** (demographic, psychographic, behavioral, needs):
  1. Ages ~22–35; lives the rec in iMessage / WhatsApp / Discord, not in a film club *(demographic / behavioral)*.
  2. Gets **2+ friend recs per week**; watches 4–10 hrs/week on streaming *(behavioral)*.
  3. Today: reacts “On my list!”, dumps titles in Notes/screenshots, forgets **who** said it and **when** *(behavioral)*.
  4. Wants a **private inbox of social promises**, not a public critic diary *(psychographic)*.
  5. Needs capture in ~10 seconds: **title, recommender, movie vs show** *(needs)*.

## 3. Customer Problems & the Bet  *(Lean Product Process: Underserved Needs → Value)*
*List the top problems, ideally as a real quote in the customer's own words.*

1. "I said 'on my list' in the chat and never put it anywhere—then Sarah asks if I watched it."
2. "I have 23 lines in Notes, half with no name, duplicates, and stuff I already watched."
3. "Netflix My List doesn’t remember **who** told me to watch it. Letterboxd feels like performing a film diary."

**The real problem (not “I need a watchlist”):**
- **Who** told her to watch it
- **When** they said it (so she knows if she’s been putting it off too long)
- **Whether** she actually followed through

The guilt isn’t about missing a movie—it’s replying “not yet” again to the same friend, or forgetting a rec entirely and making it seem like she didn’t care.

**What she does today (workarounds that fail):**

| Workaround | Why it fails |
|------------|--------------|
| WhatsApp reactions / “On my list!” | Feels polite in the moment; nothing is captured |
| Apple Notes “To watch” | No structure—no recommender, no watched state, duplicates pile up |
| Screenshots of TikToks / IG posts | Lost in Photos; no title, no friend link |
| Pinned messages in the group chat | Only a few pins; old recs scroll away |
| Netflix / Max “My List” | Tracks titles, not who recommended them or why |
| Letterboxd (tried once, abandoned) | Feels public and reviewer-y; she wants an inbox of friend recs, not a film diary |

- **Riskiest assumption** (if this is wrong, the idea fails):
  > Maya will open Rec Inbox **in the moment after a chat rec** (or the same night) instead of staying in WhatsApp + Notes. If capture is slower than a Notes line, she will not switch.
- **The bet (falsifiable):** We believe a private friend-rec inbox with fast capture, watched state, and 1–5★ ratings will get Maya to **finish the loop** instead of abandoning another list. **We'll know we're right if** in a week of real recs she **marks at least 3 titles watched and rates each of them** (not a graveyard of unwatched rows only).

## 4. Product Requirements / Functionality  *(Lean Product Process: MVP Feature Set)*

**Core action for v1:** Capture a rec in ~10 seconds—**title**, **friend’s name**, **movie or show**—right after it lands in chat.

**Key user stories** — *As a [user], I want [action] so that [outcome].*
- As Maya, I want to add a rec with **title**, **who recommended it**, and **movie or show** in ~10 seconds so I capture the social promise before it disappears in chat.
- As Maya, I want one **To watch** queue I trust—with **who** rec’d it and **how long it’s been waiting**—so I know what I still owe.
- As Maya, I want to mark a rec **watched** and rate it **1–5 stars** so I close the loop with that friend in my own records.
- As Maya, I want **Your Favorites** to show **only 5★** titles so I see what I’d actually recommend back.
- As Maya, I want a **Possible New Faves** screen that suggests similar titles from my **5★ watched** recs so I know what to queue next without scrolling Netflix.
- As Maya, I want to **sign in** so my list is the same on phone and laptop.
- As Maya, I want to see **where a title streams** so I can start it without hunting five apps.

**Must-haves for v1** — number them, set a priority, and give each a checkable acceptance criterion (a click-and-see result, not "it works"):

| ID | Requirement | Priority | Acceptance criterion (observable / measurable) |
|----|-------------|----------|------------------------------------------------|
| R1 | Add a rec: title, recommender name, type (movie or show) | P0 | Submit a complete rec → it appears in **To watch** within 2s with title, recommender, and type. After refresh (signed in), it is still there. |
| R2 | Reject incomplete add | P0 | Submit with **title** or **recommender** blank → inline message; **no** new rec is created. |
| R3 | First visit / empty To watch | P0 | With no recs yet, **To watch** shows a short empty-state (e.g. add the first friend rec)—never a blank page. |
| R4 | Show who rec’d it and when it was added | P0 | Each row in **To watch** shows recommender name and **how long ago** (or date added) so Maya can see what she’s been putting off. |
| R5 | Mark watched | P0 | From To watch, mark watched → the rec **leaves To watch** and appears in **Watched**. |
| R6 | Rate watched recs 1–5 stars (no 10-point scale) | P0 | On a watched rec, set stars 1–5 → the rating shows on that rec and survives refresh. |
| R7 | Your Favorites = **exactly 5 stars** only | P0 | A rec rated **5** appears on **Your Favorites**. A rec rated **4 or below** (or unrated) does **not**. Changing 5→4 removes it from Favorites; changing 4→5 adds it. |
| R8 | Seeded recs on first load | P0 | First visit shows sample recs (mix of to-watch, watched, and at least one 5★) so To watch, Watched, and Favorites look populated. |
| R9 | Sign in; list follows the account | P0 | Same account on a second browser/device sees the recs she added after sign-in. Signed-out user cannot see her recs. |
| R10 | Where to stream | P0 | A rec detail or row shows streaming providers for that title when lookup succeeds. If lookup fails or there is no key, the rec **still saves**; providers show an unavailable/empty state—never block add or watched. |
| R11 | **Possible New Faves** screen | P0 | Screen lists similar movies/shows derived **only** from watched recs rated **5** (same pool as Favorites). Titles rated 4 or below never drive suggestions. With **no** 5★ recs, the screen shows a short empty-state (e.g. rate something 5★ first)—never a blank page. Lookup failure still shows that empty/unavailable message; Favorites and Watched keep working. |

*(P0 = must ship for v1 · P1 = should · P2 = nice-to-have.)*

**Build order** (agents do best in sequence): 1) seed JSON in `data/recs.json` + add/list/merge (capture is the core action) → 2) show recommender + date on To watch rows → 3) mark watched + rate 1–5 + Favorites filter (rating === 5) → 4) **Possible New Faves** from those 5★ titles (seed suggestions in `data/similar.json` so the screen is populated without a live lookup) → 5) sign-in and persist recs per account → 6) server-side where-to-stream and similar-title lookup. Do not write a JSON file on the server.

**Explicitly NOT in v1 (non-goals):**
- No notifying, tagging, or messaging the friend when Maya watches or rates something.
- No public profile, activity feed, or Letterboxd-style log of “everything I’ve ever seen” (only **friend recs she added**).
- No episode-by-episode progress, season tracking, or “currently watching” mid-show state.
- No import from WhatsApp, screenshots, or streaming-app My List.
- No half-stars; no 10-point scale.
- Similar titles are **not** based on 4★ (or lower), on To watch, or on other users’ lists.
- No auto-adding a similar title to To watch unless Maya chooses to add it.
- No native mobile app (responsive web is fine).

**Do NOT change / keep working** (fill in only when iterating on an existing build):
- *(empty — first build.)*

## 5. Data Model *(optional)*
*What objects/records must the app store, with key fields and how they relate? These names are the JSON now and the Neon table later — keep them stable.*

**Persistence:** seed samples in `data/recs.json` · until the account store is live, merge seed + localStorage for new recs · do not write JSON on the server · same field names when the signed-in store is added.

- **Rec** — seed in `data/recs.json`. Fields: `id`, `title`, `type` (`movie` \| `show`), `recommender_name`, `status` (`to_watch` \| `watched`), `rating` (`1`–`5` or `null` until rated), `created_at`, `watched_at` (optional). `[ASSUMPTION]` streaming snapshot fields: `watch_providers` (array of provider names) and `watch_providers_updated_at` (optional). Relates to: the signed-in **User** who owns the rec.
- **User** — account for cross-device list. Fields: `id`, `email` (or whatever the sign-in provider returns). Relates to: many Recs. No friend accounts, no shared group list in v1.
- **Favorites** — not a separate table. Derived: `status === watched` AND `rating === 5`.
- **Similar suggestion** — seed in `data/similar.json` (keyed by source title). Fields: `source_title`, `title`, `type` (`movie` \| `show`). Shown on **Possible New Faves** when the source is one of Maya’s 5★ watched recs. Live lookup (when wired) returns the same shape from the server; do not invent a second object name. Relates to: Rec (source is a 5★ watched rec).
- **Example record:** `{ "id": "1", "title": "Slow Horses", "type": "show", "recommender_name": "Jake", "status": "to_watch", "rating": null, "created_at": "2026-09-20T12:00:00Z" }`

## 6. Guidance on User Experience *(optional)*
- **Main user flow** (first visit → core value): 1) open Rec Inbox (sign in if required for her saved list) → 2) **To watch** (seeded + hers; each row shows recommender + how long waiting) → 3) **Add rec** (title, recommender, movie/show) in ~10 seconds → 4) later: mark **watched** → 5) rate **1–5 stars** → 6) if **5**, it appears on **Your Favorites** → 7) open **Possible New Faves** for similar titles from those 5★ recs → 8) optionally add a similar title to **To watch** → 9) open a rec to see **where to stream**.
- **Screens:** **To watch** · **Watched** · **Your Favorites** · **Possible New Faves** (Favorites = the 5★ titles themselves; Possible New Faves = similar titles those 5s suggest).
- **Error / empty states:** Empty To watch / Watched / Favorites / Possible New Faves each get a short message (Favorites and Possible New Faves: no 5★ yet). Blank title or recommender → inline error, no new rec. Streaming or similar-title lookup fail → recs stay; those panels show unavailable/empty—never a blank page.
- **Visual aesthetic:** Follow `DESIGN.md`. Do not name a palette here.

## 7. Guidance on Tech Stack / Components *(optional)*
- **Course default:** Next.js + React + Tailwind + shadcn/ui, deploy on Vercel. Seed from `data/recs.json`; new items in localStorage until the signed-in store is wired. Call third-party APIs and the database only from server code.
- **My preferences / must-use:** Sign-in so the list is per account across devices. Where-to-stream and similar-title lookup via **server** code (not from the browser). Secrets only in `.env`. Seed similar picks in `data/similar.json` so **Possible New Faves** works when no lookup key is set.
- **Must-avoid** (product-specific): No public social graph. No friend notifications. No Letterboxd import. No paid streaming-affiliate requirement for v1. If the watch-provider or similar-title key is missing, degrade (R10, R11) — do not crash the page or block adding recs.

## 8. Other Info & Open Questions *(optional)*
- **Constraints / deadlines:** v1 is the friend-rec loop + Favorites + Possible New Faves + account + where-to-stream; not a social network.
- **Products I admire (as references):** WhatsApp (where the rec is born) · Notes (capture speed) · streaming My List (queue, but no recommender) · Letterboxd (watched + stars — **do not copy** public diary / critic identity).
- **Open questions to resolve:** *(mark guesses with `[ASSUMPTION]`)*
  - `[ASSUMPTION]` Working name **Rec Inbox** — rename if you want something else on screen.
  - `[ASSUMPTION]` Recommender is **free-text name** (Jake, Priya), not a contact picker or friend account.
  - `[ASSUMPTION]` Rating is optional until she sets it; unrated watched items stay in Watched, never Favorites.
  - `[ASSUMPTION]` Watch providers via TMDB (or similar) with a server key; region **US** unless she sets otherwise later.
  - `[ASSUMPTION]` Sign-in is email-based; no social login required in v1.
  - `[ASSUMPTION]` Duplicate titles allowed (two friends can rec the same thing as two rows) unless we later add merge.
  - `[ASSUMPTION]` Similar titles come from the same catalog lookup as streaming (e.g. TMDB “similar”); hide titles already on To watch or Watched.
  - `[ASSUMPTION]` Adding a similar pick to To watch uses recommender **Because you loved [5★ title]** unless she edits it.
