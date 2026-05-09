# Tests Documentation

All tests are written in Jest to strictly enforce mathematical validity of our Return on Investment calculations without manual intervention.

## Automated Tests implemented in `auditEngine.test.ts`

To run locally: `npx jest`

### 1. Enterprise Overkill
- **Covers:** Logic ensuring small teams (< 5 seats) are actively flagged and downgraded from Enterprise to Team tiers.
- **Why:** Massive source of Credex Lead Gen, as startups often buy Enterprise indiscriminately.

### 2. Retail Standard Overpay
- **Covers:** Logic checking if a user's stated monthly spend aggressively dwarfs the actual retail price * seats calculation.
- **Why:** Flags unused/phantom seats mathematically.

### 3. Team Plan Unnecessary
- **Covers:** Checks if team plans are used for 1 or 2 users where ROI doesn't validate the base platform fee. Recommended downgrade to Pro/Plus.

### 4. Context Mismatch
- **Covers:** B2B contextual validation - e.g if the primary use case is `Writing`, but they are paying for `Cursor` or `Copilot`.

### 5. Honest Optimization
- **Covers:** A rigid negative check insuring we output `$0` savings when a team genuinely sits exactly on the optimal seat/plan ratio. No false padding.
