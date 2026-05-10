# Reflection

---

## 1. The hardest bug you hit this week, and how you debugged it

The hardest issue was a persistent **hydration mismatch in Next.js App Router** caused by state being initialized from `localStorage` while also rendering dynamic `<select>` options based on that state. On the server, React rendered default values like `"Enterprise"` and `"Pro"`, but on the client, `useEffect` would immediately replace them with persisted values, causing a mismatch between SSR and hydration trees.

My first hypothesis was that `localStorage` timing was the issue, so I tried delaying state hydration using a `mounted` flag. That reduced the frequency but didn’t eliminate the mismatch. Next, I suspected the issue came from computed rendering inside JSX (`getPlansFor(t.toolName).map(...)`), which was producing different option sets between server and client.

I then isolated the issue by hardcoding tool state and confirmed hydration was stable. This proved the root cause was **non-deterministic initial state + derived UI options**.

The final fix was:
- Moving initial state to deterministic defaults
- Hydrating `localStorage` only after mount
- Ensuring dropdown options never depended on transient render state

Once this separation was enforced, hydration stabilized completely.

---

## 2. A decision you reversed mid-week, and what made you reverse it

I initially decided to use **Tailwind CSS** because it is faster for rapid UI development. However, as the audit UI became more complex (multi-panel layout, comparison cards, and conditional savings states), Tailwind started making JSX harder to read and reason about.

I reversed the decision and moved to **vanilla CSS modules** because:
- I needed precise control over layout consistency across audit states
- Conditional UI states (overspend vs optimized) required cleaner separation of styling logic
- It reduced visual clutter in component code, improving maintainability

This trade-off slowed initial development but significantly improved long-term readability and debugging speed.

---

## 3. What you would build in week 2 if you had it

In week 2, I would build an **automatic spend ingestion pipeline** instead of manual entry. Right now, users must input tools manually, which creates friction.

The improvement would be:
- Upload PDF invoices (Stripe, OpenAI, Google, GitHub, etc.)
- OCR extraction of line items
- LLM-based classification of SaaS tools and pricing tiers
- Auto-population into the audit engine

This would turn the product from a “calculator tool” into a **continuous spend monitoring system**, which is significantly more valuable for startups because it removes manual reporting entirely.

---

## 4. How you used AI tools

I used AI tools mainly for:
- Boilerplate generation (UI scaffolding, API route structure)
- Debugging suggestions for Next.js hydration and React hook issues
- Drafting fallback logic for AI-generated audit summaries

I explicitly did NOT trust AI for:
- Pricing logic
- Audit engine calculations
- Final business rules for savings estimation

One specific issue: Claude suggested incorrect pricing tiers for Cursor and Copilot based on outdated assumptions. I caught this by cross-verifying against official pricing pages and ended up hardcoding a `PRICING_DATA.md` source-of-truth file instead of trusting model output.

This reinforced that **LLMs are useful for structure, not financial correctness** in this system.

---

## 5. Self-rating on a 1–10 scale

- **Discipline:** 8 — Maintained consistent daily progress across most of the week, with visible commit history and incremental builds.
- **Code Quality:** 7 — Clean structure with separated audit engine logic, but some React state complexity introduced avoidable hydration edge cases.
- **Design Sense:** 8 — Focused on clarity of savings visualization and strong contrast between “optimized” vs “overspending” states.
- **Problem-Solving:** 9 — Systematically debugged hydration, API integration, and state persistence issues using isolation and hypothesis testing.
- **Entrepreneurial Thinking:** 8 — Designed product around lead generation + Credex upsell funnel rather than just a calculator tool.