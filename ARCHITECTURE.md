# Architecture

## System Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant MathLogic (Client)
    participant Next.js API route
    participant LLM (Anthropic)
    participant Database (Supabase)
    participant Mail (Resend)

    User->>Frontend: Selects Tool, Seats, and Monthly Spend
    Frontend->>MathLogic (Client): Evaluates specific Edge case ROI
    MathLogic (Client)-->>Frontend: Returns Savings & Optimal Plan
    User->>Frontend: Clicks "Run Spend Audit"
    Frontend->>Next.js API route: POST /api/audit (Input + Results)
    Next.js API route->>LLM (Anthropic): Generate specific 100-word feedback
    LLM (Anthropic)-->>Next.js API route: Resolves specific text
    Next.js API route->>Database (Supabase): Save Audit (ID, PII-stripped Data)
    Database (Supabase)-->>Next.js API route: Returns uuid & Success
    Next.js API route-->>Frontend: Display AI summary and savings
    User->>Frontend: Optionally enters Email to capture leads
    Frontend->>Next.js API route: POST /api/lead
    Next.js API route->>Database (Supabase): Attach Email to existing UUID
    Next.js API route->>Mail (Resend): Trigger Transactional Email
```

## Why this stack? (Next.js / Supabase / Anthropic)
- **Next.js:** Server Actions and Edge APIs make spinning up lightweight transactional lead forms seamless without needing an explicit Express/Django backend, cutting latency.
- **Supabase:** Instant Postgres schema modeling with automatic PostgREST bridging. 
- **Anthropic:** Claude 3 Haiku is lightning fast and relatively cheap for <200 token localized outputs.

## 10k Audits/Day Evolution
If this tool scaled to 10k requests/day:
1. **Edge DB:** Move Supabase to a distributed Read-Replica structure or switch to Cloudflare D1 to eliminate latency geographically.
2. **LLM Queuing:** Wrap the `/api/audit`Anthropic call inside a \`Redis / Inngest / Upstash\` queue to prevent hitting Anthropic rate limits, processing LLM summarization asynchronously and streaming it up via SSE.
3. **Caching:** Statically cache the pricing models globally via \`getStaticProps\` or KV.
