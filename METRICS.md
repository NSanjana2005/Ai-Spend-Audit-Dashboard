# Product Metrics

## The North Star Metric
**Qualified Audits Run per Week** (Audits resulting in >$500/mo identified savings).
*Why:* A raw "Audit Run" means nothing if they're a 1-person hobby dev looking for $10 savings. Identifying bulk enterprise overkill connects directly to Credex’s pipeline and core B2B value vector. Generating massive numbers here proves direct product-market fit.

## 3 Input Metrics driving the North Star
1. **Public URL Sharing Coefficient:** The percentage of users who take the `/share/id` link and actively post it to Twitter/LinkedIn to flex their optimization score.
2. **"Email Captured" Conversion Rate:** Funnel rate of (Audits with >$500 savings) vs (Emails provided to request the discounted volume credits).
3. **Session-to-Audit Conversion:** How many unique visitors successfully complete placing >2 tools inside the calculator vs bouncing immediately off the hero layout.

## What I'd instrument first
PostHog or Mixpanel event tracking specifically on the `runAudit` client function firing, tied to the aggregate `totalMonthlySavings` integer inside the payload footprint.

## What number triggers a pivot decision
If the **"Email Captured" Conversion Rate drops below 3%** for our primary qualification bounds (>$500/mo), the pivot decision triggers. That would indicate a massive fundamental breakdown: founders are seeing our mathematically correct "you are losing money" alert, yet still don't trust us enough to input their email. The pivot here requires drastically rewriting the CTA framing, or dropping the gated threshold completely and providing wholesale deals directly on site.
