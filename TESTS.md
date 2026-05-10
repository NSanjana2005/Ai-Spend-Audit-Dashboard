# Tests Documentation

All tests are written in Jest and validate the correctness of the audit engine as a deterministic financial rules system (not an LLM-driven component).

The goal is to ensure:
- no inflated savings
- no false positives in overspend detection
- pricing logic remains stable and auditable


## Automated Tests implemented in `auditEngine.test.ts`

To run locally: `npx jest`

### 1. Enterprise Over-provisioning Detection
- **What it tests:** Detects cases where small teams (≤ 5 users) are placed on Enterprise-tier plans across tools like ChatGPT, Copilot, or Claude.
- **Why it matters:** Enterprise plans are a common source of silent overspend in early-stage startups due to default procurement decisions.
- **Expected behavior:** Engine should recommend downgrade to Team or Pro tier where functionally equivalent.

### 2. Seat Utilization vs Billing Mismatch

- **What it tests:** Ensures monthly spend aligns with actual seat usage (users × plan cost).
- **Why it matters:** Prevents phantom seat billing (unused licenses still being paid for).
- **Expected behavior:** Flags overbilling when: 
     reported spend >> expected price per seat × active users

### 3. Plan Tier Overkill Detection

- **What it tests:** Detects unnecessary usage of Team/Enterprise plans for 1–2 person setups.
- **Why it matters:** Early-stage startups often upgrade plans “just in case,” leading to      inefficient burn.
- **Expected behavior:** Suggests downgrade to Pro/Individual tiers when usage patterns are minimal.

### 4. Use-Case Misalignment Rule

- **What it tests:** Validates mismatch between tool category and actual usage context (e.g., using Cursor for writing-heavy workflows).
- **Why it matters:** Ensures recommendations are not purely price-based but context-aware.
- **Expected behavior:** Engine adjusts recommendation based on primary use case weighting.

### 5. Zero-Savings Integrity Check

- **What it tests:** Ensures the system does NOT generate artificial savings when user is already optimally configured.
- **Why it matters:** This is critical for trust — false positives would break credibility of the product.
- **Expected behavior:** If configuration is optimal:
 total savings must equal 0
status = OPTIMIZED