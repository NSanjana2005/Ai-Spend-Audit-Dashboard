export interface AuditInput {
  toolName: string;
  currentPlan: string;
  monthlySpend: number;
  users: number;
}

export interface AuditContext {
  totalTeamSize: number;
  primaryUseCase: 'Coding' | 'Writing' | 'Research' | 'Data' | 'Mixed';
}

export interface AuditResult {
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedPlan: string;
  recommendedSpend: number;
  potentialSavings: number; // Monthly savings
  yearlySavings: number; // Yearly savings
  reason: string;
  status: 'OPTIMIZED' | 'SAVINGS_FOUND';
}

// Pricing database for supported tools
const PRICING_DB: Record<string, {
  individual: { name: string; price: number };
  team: { name: string; price: number };
  enterprise?: { name: string; price: number };
  usageBased?: boolean;
}> = {
  "ChatGPT": {
    individual: { name: "Plus", price: 20 },
    team: { name: "Team", price: 30 },
    enterprise: { name: "Enterprise", price: 60 }
  },
  "Claude": {
    individual: { name: "Pro", price: 20 },
    team: { name: "Team", price: 30 },
    enterprise: { name: "Enterprise", price: 60 }
  },
  "GitHub Copilot": {
    individual: { name: "Individual", price: 10 },
    team: { name: "Business", price: 19 },
    enterprise: { name: "Enterprise", price: 39 }
  },
  "Cursor": {
    individual: { name: "Pro", price: 20 },
    team: { name: "Business", price: 40 }
  },
  "Gemini": {
    individual: { name: "Advanced", price: 20 },
    team: { name: "Enterprise", price: 30 }
  },
  "Windsurf": {
    individual: { name: "Pro", price: 15 },
    team: { name: "Team", price: 25 }
  },
  "v0": {
    individual: { name: "Premium", price: 20 },
    team: { name: "Team", price: 30 }
  },
  "OpenAI API": {
    usageBased: true,
    individual: { name: "Pay-as-you-go", price: 0 },
    team: { name: "Pay-as-you-go", price: 0 }
  },
  "Anthropic API": {
    usageBased: true,
    individual: { name: "Pay-as-you-go", price: 0 },
    team: { name: "Pay-as-you-go", price: 0 }
  }
};

// Helpers for normalization
function normalizeToolName(name: string): string | null {
  const normalized = name.toLowerCase().replace(/\s+/g, '');
  for (const key of Object.keys(PRICING_DB)) {
    if (key.toLowerCase().replace(/\s+/g, '') === normalized) {
      return key;
    }
  }
  return null;
}

function normalizePlanTier(plan: string): 'individual' | 'team' | 'enterprise' | 'usage' {
  const normPlan = plan.toLowerCase();

  if (normPlan.includes('enterprise')) return 'enterprise';
  if (normPlan.includes('team') || normPlan.includes('business')) return 'team';
  if (normPlan.includes('api') || normPlan.includes('usage') || normPlan.includes('pay')) return 'usage';
  
  // Default to individual for "Pro", "Plus", "Individual", "Premium", "Advanced", etc.
  return 'individual';
}

function buildResult(
  tool: AuditInput, 
  recommendedPlan: string, 
  recommendedSpend: number, 
  reason: string, 
  status: 'OPTIMIZED' | 'SAVINGS_FOUND' = 'SAVINGS_FOUND'
): AuditResult {
  const potentialSavings = Math.max(0, tool.monthlySpend - recommendedSpend);

  if (potentialSavings <= 0) {
    status = 'OPTIMIZED';
    reason = "Current setup looks optimized.\nNo major savings opportunity detected.";
  }

  return {
    toolName: tool.toolName,
    currentPlan: tool.currentPlan,
    currentSpend: tool.monthlySpend,
    recommendedPlan,
    recommendedSpend,
    potentialSavings,
    yearlySavings: potentialSavings * 12,
    reason,
    status
  };
}

export function analyzeToolSpend(tool: AuditInput, context: AuditContext): AuditResult {
  const optimizedResult = buildResult(tool, tool.currentPlan, tool.monthlySpend, "Current setup looks optimized.\nNo major savings opportunity detected.", 'OPTIMIZED');

  const matchedTool = normalizeToolName(tool.toolName);
  // If we don't recognize the tool, assume it's optimized rather than making fake savings.
  if (!matchedTool) return optimizedResult;

  const pricing = PRICING_DB[matchedTool];
  const planTier = normalizePlanTier(tool.currentPlan);

  // Cross-check 1: Use Case Mismatch
  if (context.primaryUseCase !== 'Coding' && context.primaryUseCase !== 'Mixed') {
    const isCodingTool = ['GitHub Copilot', 'Cursor', 'Windsurf'].includes(matchedTool);
    if (isCodingTool) {
      return buildResult(
        tool, 
        'None/Cancel', 
        0, 
        `Your primary use case is ${context.primaryUseCase}, but you are paying for a coding-specific tool (${tool.toolName}). Consider dropping this to save costs.`
      );
    }
  }

  // Cross-check 2: Ignoring APIs for hard limits, due to dynamic usage
  if (pricing.usageBased || planTier === 'usage') {
    return optimizedResult; // APIs are usually pay-as-you-go, hard to audit statically on seats
  }

  // Cross-check 3: Enterprise Overkill
  if (planTier === 'enterprise' && pricing.team) {
    // Arbitrary threshold: Teams of 3 or less do not need enterprise
    if (tool.users <= 3) {
      const recommendedSpend = pricing.team.price * tool.users;
      return buildResult(
        tool, 
        pricing.team.name, 
        recommendedSpend, 
        `Enterprise plans are usually unnecessary for very small teams (${tool.users} users). Switching to ${pricing.team.name} covers normal use cases.`
      );
    }
  }

  // Cross-check 4: Team Plan Unnecessary
  if (planTier === 'team') {
    // 1-2 users often do just fine on individual plans
    if (tool.users <= 2) {
      const recommendedSpend = pricing.individual.price * tool.users;
      return buildResult(
        tool, 
        pricing.individual.name, 
        recommendedSpend, 
        `Team features often do not justify the higher pricing for 1-2 users. Switching to individual plans saves money while providing the same underlying AI model.`
      );
    }
  }

  // Cross-check 5: Overpaying vs Actual Pricing
  let expectedPricePerSeat = pricing.individual.price;
  if (planTier === 'enterprise' && pricing.enterprise) {
    expectedPricePerSeat = pricing.enterprise.price;
  } else if (planTier === 'team') {
    expectedPricePerSeat = pricing.team.price;
  }
  
  const expectedSpend = expectedPricePerSeat * tool.users;
  const overspendDifference = tool.monthlySpend - expectedSpend;
  
  if (expectedSpend > 0 && overspendDifference >= 10) {
    // If they are paying at least $10 more than the math suggests
    return buildResult(
      tool, 
      tool.currentPlan + " (Fixed Seat Count)", 
      expectedSpend, 
      `Significant overspend detected: Standard pricing for ${tool.currentPlan} is ~$${expectedPricePerSeat}/user. You may be paying for unused seats or an incorrect plan.`
    );
  }

  // Final check: if team size is significantly smaller than seats, they might have phantom seats
  if (tool.users > context.totalTeamSize) {
    const recommendedSpend = expectedPricePerSeat * context.totalTeamSize;
    return buildResult(
        tool,
        tool.currentPlan,
        recommendedSpend,
        `You have ${tool.users} seats assigned, but total team size is only ${context.totalTeamSize}. Removing unassigned phantom seats leads to direct savings.`
    );
  }

  // If no conditions hit, it is optimized
  return optimizedResult;
}

export function runAuditCycle(inputs: AuditInput[], context: AuditContext): AuditResult[] {
  return inputs.map(input => analyzeToolSpend(input, context));
}
