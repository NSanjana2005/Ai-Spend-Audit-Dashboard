# Credex AI Spend Audit Engine

The Credex Audit Engine is an intelligent benchmarking product that allows startups to quickly figure out exactly where they are overspending on AI models and tools. Designed for engineering managers and founders, it acts as a lead generation funnel by explicitly identifying overkill enterprise plans and unused phantom seats, before seamlessly pitching Credex's volume-discounted credits for those exact tools.

## Screenshots / Video
*[Embed 3 screenshots or a 30-second Loom link here before submission]*

## Quick Start
1. \`npm install\`
2. Duplicate \`.env.example\` to \`.env.local\` and add your \`NEXT_PUBLIC_SUPABASE_URL\`, \`ANTHROPIC_API_KEY\`, and \`RESEND_API_KEY\`.
3. Run \`npm run dev\` and access the frontend at \`localhost:3000\`.

## Decisions & Trade-Offs

1. **Vanilla React Context vs Global State (Redux/Zustand):** Kept state strictly local to \`page.tsx\` via standard Context variables rather than importing a large global state library. Given this is a 2-page app focused on one funnel, Zustand is overkill.
2. **Vanilla CSS vs Tailwind:** Opted for CSS Modules/Vanilla CSS explicitly to create a premium, clean structure. Tailwind speeds up initial styling but can bloat jsx and complicate direct DOM overriding, though Tailwind is industry standard - utilizing Vanilla CSS limits hydration clashes here.
3. **Client-side Audit vs Server-side computation:** The heavy ROI mathematical logic is kept strictly on and executed via the Client component. This saves significant server cost. The server is strictly reserved for the LLM interaction and Database commit.
4. **Resend vs other Email providers:** Resend's API matches modern Node.js edge environments excellently and doesn't stringently require SMTP boilerplate, allowing us to send transactional emails in <5 lines of code.
5. **No Auth Modal on Capture:** Purposely skipped adding NextAuth/Auth0. Adding friction right before demonstrating value reduces conversions in B2B lead generation. We capture email strictly at the value-exchange phase (Post-Audit).

## Live URL
*[Insert your Vercel/Render URL here before submission]*
