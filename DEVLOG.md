# Devlog

> **Reminder:** We read git logs. Commits must occur on at least 5 distinct calendar days within the 7-day window.

---

## Day 1 — 2026-05-06
**Hours worked:** 4

**What I did:**
- Bootstrapped Next.js 16 app using App Router
- Designed initial data model for AI tool spend inputs (Tool, Plan, Seats, Spend)
- Set up baseline UI layout for audit dashboard

**What I learned:**
- App Router hydration behaves differently from Pages Router when using client state + localStorage
- Initial mismatch issues appear when rendering dynamic `<select>` options on SSR

**Blockers:**
- Hydration mismatch caused by localStorage-dependent state initialization

**Plan for tomorrow:**
- Implement audit engine logic for spend comparison rules

---

## Day 2 — 2026-05-07
**Hours worked:** 5

**What I did:**
- Built core audit engine logic for plan downgrade detection
- Added rule-based savings computation per tool
- Implemented multi-tool evaluation pipeline

**What I learned:**
- Deterministic rule engines are more reliable than LLMs for pricing decisions
- Small pricing assumptions drastically affect savings output

**Blockers:**
- Handling inconsistent plan names across vendors

**Plan for tomorrow:**
- Build results UI and integrate audit output into frontend

---

## Day 3 — 2026-05-08
**Hours worked:** 6

**What I did:**
- Integrated audit engine with UI dashboard
- Built results visualization (current vs recommended spend)
- Added per-tool breakdown cards with reasoning

**What I learned:**
- UX clarity matters more than raw data — users need “why” not just numbers

**Blockers:**
- UI re-renders causing plan dropdown inconsistencies

**Plan for tomorrow:**
- Add Supabase backend + persist audit results

---

## Day 4 — 2026-05-09
**Hours worked:** 5

**What I did:**
- Integrated Supabase for lead capture + audit storage
- Added API routes for `/api/audit` and `/api/lead`
- Configured transactional email flow using Resend

**What I learned:**
- Serverless functions require strict payload validation to avoid silent failures

**Blockers:**
- API response inconsistency between dev and production builds

**Plan for tomorrow:**
- Add AI-generated summary + polish UI

---

## Day 5 — 2026-05-10
**Hours worked:** 7

**What I did:**
- Integrated AI-generated executive summary (Anthropic/OpenAI fallback)
- Implemented shareable `/share/[id]` public audit pages
- Fixed hydration issues caused by localStorage + SSR mismatch
- Configured deployment on Vercel
- Added final UI polish + savings highlights logic

**What I learned:**
- Hydration errors often come from non-deterministic state, not React itself
- Production debugging requires testing build output, not just dev server

**Blockers:**
- ESLint rule for setState inside useEffect caused build lint errors

**Plan for tomorrow:**
- Final submission + documentation polish

---

## Day 6 — 2026-05-11
**Hours worked:** 2

**What I did:**
- Final README polish
- Added screenshots and deployment link
- Verified Lighthouse performance scores

**What I learned:**
- Documentation quality directly affects evaluator perception

**Blockers:**
- None

**Plan for tomorrow:**
- Submission

---

## Day 7 — 2026-05-12
**Hours worked:** 1

**What I did:**
- Final QA testing
- Verified all routes, API endpoints, and share links
- Prepared submission package

**What I learned:**
- Small UX polish (loading states, empty states) improves perceived product quality significantly

**Blockers:**
- None

**Plan for tomorrow:**
- Submit assignment