# Spec 001 — AI similar picks on Possible New Faves

| Field | Value |
|---|---|
| **Status** | `planned` |
| **Owner** | Uzoma |
| **Started** | 2026-09-29 |
| **Done** | — |
| **Strategy ref** | `PRD.md` § 4 (R7, R11), § 5 (Similar suggestion), § 6 |

> On **Possible New Faves**, for each watched rec rated **5 stars**, the app asks the server for AI-generated similar movies/shows Maya would like—and lets her add any pick to **To watch**.

---

## 1. What ships when this is done

Maya opens **Possible New Faves** and sees suggestions grouped by each of her **5★** watched friend recs (same pool as **Your Favorites**). For each favorite, the app shows a short list of similar titles with movie/show type and a one-line reason. She can tap **Add to To watch** on any suggestion. If she has no 5★ recs yet, she sees a clear empty state. If the AI call fails or there is no API key, the screen still works using seeded suggestions from `data/similar.json`.

## 2. User stories

- **As Maya**, when I open **Possible New Faves**, I need similar titles for each movie/show I rated **5 stars** so I can find what to watch next without scrolling Netflix.
- **As Maya**, when I see a suggestion I like, I need to add it to **To watch** in one tap so it joins my friend-rec inbox like any other rec.
- **As Maya**, when I have not rated anything 5 stars yet, I need a short message telling me what to do so the screen never feels broken.

## 3. Surfaces

- Routes: `/possible-new-faves` (or tab route equivalent)
- Components: `components/possible-new-faves-screen.tsx`, `components/similar-suggestion-card.tsx`, `components/similar-suggestions-section.tsx` (one section per 5★ source title)
- Actions / API: `app/api/similar-recs/route.ts` (POST) or `app/actions/get-similar-recs.ts`
- Seed / lib: `data/similar.json` · `data/recs.json` · `lib/similar-recs.ts` · `lib/favorites.ts` · `lib/openai.ts`
- Env vars: `OPENAI_API_KEY` (server-only; model hardcoded as `gpt-4o-mini`)

## 4. Done criteria

- [ ] WHEN Maya has at least one watched rec rated **5** and opens **Possible New Faves** THE system SHALL show one section per 5★ title, each labeled **Because you loved [title]**, with at least **2** similar suggestions (title + movie/show type).
- [ ] WHEN the server receives a valid 5★ source rec (`title`, `type`) THE system SHALL return suggestions in shape `{ title, type, reason }` where `type` is `movie` or `show` and `reason` is one short sentence explaining the match.
- [ ] WHEN Maya taps **Add to To watch** on a suggestion THE system SHALL create a new rec with that title and type, `recommender_name` defaulting to **Because you loved [source title]** (editable before save if the add flow allows edit), and it SHALL appear on **To watch** after refresh.
- [ ] IF Maya has **no** watched recs rated **5** THEN THE system SHALL show: *Rate something 5 stars first—then we'll suggest what to watch next.* — never a blank page.
- [ ] IF a suggestion title already exists on **To watch** or **Watched** (case-insensitive title match) THEN THE system SHALL NOT show that suggestion in the list for that source.
- [ ] IF `OPENAI_API_KEY` is unset OR the OpenAI request fails THEN THE system SHALL fall back to `data/similar.json` for that source title when seed rows exist; IF no seed exists THE system SHALL show an unavailable message for that section only—**To watch**, **Watched**, and **Your Favorites** SHALL keep working.
- [ ] IF the user submits **Add to To watch** with a blank title (if inline add is offered) THEN THE system SHALL show an inline error and SHALL NOT create a rec.
- [ ] WHEN Maya refreshes after adding a suggestion to **To watch** THE system SHALL still show that new rec on **To watch**.
- [ ] `npm test` succeeds (`lib/` coverage floor)
- [ ] `npm run build` succeeds

## 5. Constraints (must NOT)

- Do not suggest from recs rated **4 or below**, from **To watch**, or from other users' lists (`PRD.md` non-goals).
- Do not auto-add suggestions to **To watch**—only when Maya taps add.
- Do not call OpenAI from the browser; only from `lib/openai.ts` via server route/action.
- Do not add `OPENAI_MODEL` or any model env var—hardcode `"gpt-4o-mini"`.
- Do not write suggestions to a JSON file on the server.
- Do not block **Possible New Faves** page load if AI fails—degrade to seed or per-section unavailable state.
- Do not invent a second suggestion object shape—live AI and seed both map to `{ title, type, reason }` (seed may omit `reason`; UI shows a generic line like *Similar to [source]* when missing).
- Do not change **Your Favorites** filter logic (`rating === 5` only).
- Follow `DESIGN.md` for layout; no new color system.

## 6. Out of scope (for this spec)

- Where to stream on suggestion cards — see `PRD.md` R10 / future spec
- Sign-in and cross-device sync — see `PRD.md` R9 / future spec
- Notifying the friend who originally rec'd the 5★ title — `PRD.md` non-goal
- Re-ranking suggestions across multiple 5★ sources into one blended feed — future enhancement
- Caching AI responses in Neon — future; v1 may re-fetch on each page load or use in-memory cache per request only

## 7. Dependencies

- **Blocking:** Watched + rate flow shipped so Maya can have `status === watched` and `rating === 5` recs (core list slice — `planned`)
- **Blocking:** **Your Favorites** filter (`rating === 5`) — same slice or prior
- **Nice-to-have:** Seed file `data/similar.json` populated for demo titles in `data/recs.json`
- **Blocking (human):** `OPENAI_API_KEY` in `.env` for live AI in dev; build and first load must work without it

## 8. Open questions

| Question | Owner | Blocking? |
|---|---|---|
| How many suggestions per 5★ source—2, 3, or 5? | Uzoma | no — default **3** in implementation unless changed |
| Show all 5★ sections on one scrollable page, or one source at a time? | Uzoma | no — default **one page, sections stacked** per wireframes |
| Should `reason` be visible on the card or only on expand? | Uzoma | no — default **visible subtitle** under title |

## 9. Architecture notes

**Source pool:** `getFavoriteRecs(recs)` → `status === 'watched' && rating === 5` (same as **Your Favorites**).

**Request flow:**

```
Possible New Faves (client)
  → for each favorite: POST /api/similar-recs { sourceTitle, sourceType }
    → lib/similar-recs.ts
      → if OPENAI_API_KEY: lib/openai.ts (structured JSON response)
      → else: read data/similar.json by source_title
      → filter out titles already on To watch / Watched
  → render sections
```

**OpenAI prompt (load-bearing):**
- Input: source `title`, `type` (`movie` \| `show`).
- Output: JSON array of `{ "title": string, "type": "movie" | "show", "reason": string }`.
- Instructions: real, streamable titles; match tone/genre/pace of source; no spoilers; max 3 per call; same type mix as source unless a show could pair with a movie spin-off (prefer same type).

**Seed fallback (`data/similar.json`):**

```json
[
  {
    "source_title": "Past Lives",
    "title": "Aftersun",
    "type": "movie",
    "reason": "Quiet, emotional stories about memory and family."
  }
]
```

**Add to To watch:** reuse existing `addRec` validation (title + recommender required). Default recommender: `Because you loved Past Lives`.

## 10. Domain & quality guardrails

- Stack and secrets: `.cursor/rules/workshop.mdc`
- Folders: `.cursor/rules/folders.mdc`
- Look: `DESIGN.md`
- Copy: product language only—"Possible New Faves", "Because you loved …", not internal terms like "LLM" or "embedding" in UI

## 11. Test plan

**`lib/`**
- `getFavoriteRecs` — empty, mixed ratings, only 5★ returned
- `filterAlreadyQueued` — hides titles on To watch and Watched; case-insensitive
- `getSimilarSuggestions` — happy path with mocked OpenAI; missing key → seed; empty seed → `[]`; malformed AI JSON → fallback or empty section
- `parseSimilarResponse` — valid JSON; invalid → safe failure

**Screen (≤5 cases)**
- No 5★ recs → empty state copy
- One 5★ + mocked suggestions → section renders with add buttons
- Add suggestion → appears on To watch; refresh persists
- Suggestion already on list → not shown
- API failure with seed present → seed suggestions still show

**Build:** `npm test` then `npm run build`

**PRD:** walk R11 acceptance criterion end-to-end

## 12. Change log

| Date | Change |
|---|---|
| 2026-09-29 | Spec created. AI similar picks for 5★ sources on Possible New Faves. |
