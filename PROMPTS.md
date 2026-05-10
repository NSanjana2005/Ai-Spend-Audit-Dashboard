# Prompts Architecture

## Core Summary Prompt
Used inside \`/api/audit/route.ts\` to generate the personalized summary feedback based on the exact tools a company is utilizing.

\`\`\`text
You are a financial operator at a B2B SaaS startup. You just audited a company's software spend.
Context: A team of {totalTeamSize} primarily focused on {primaryUseCase}.
Current tools: {tools list}.
Total monthly savings opportunity: ${totalSavings}.
Write a concise, 100-word personalized summary to the founder explaining where their money is going and hinting at why they should care. 
Be conversational and direct, not overly robotic. Do not mention specific plan prices, just general strategic advice based on the tools selected.
\`\`\`

## Why this prompt?
- **Audience matching:** Activating the "financial operator" persona ensures the LLM doesn't act like a generic AI assistant, but instead sounds like a CFO mapping unit economics.
- **Constraining scope:** Mentioning "do not mention specific plan prices" prevents the LLM from hallucinating prices that contradict our rigid, mathematically correct \`auditEngine.ts\` output natively displayed on the dashboard. It must solely stick to high-level strategic observations (e.g. "You're paying for very heavy IDE tools when your team is mostly data analysts").
- **Cost control:** Setting strict max response limits (100 words enforced natively by Anthropic \`max_tokens = 250\`) keeps generation latency sub-second and API costs practically nil.
