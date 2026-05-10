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

// Exactly as demanded by Assignment:
// Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf
const PRICING_DB: Record<string, {
  plans: Record<string, number>;
  isApiOnly?: boolean;
}> = {
  "Cursor": {
    plans: { "Hobby": 0, "Pro": 20, "Business": 40, "Enterprise": 80 } // Enterprise estimated
  },
  "GitHub Copilot": {
    plans: { "Individual": 10, "Business": 19, "Enterprise": 39 }
  },
  "Claude": {
    plans: { "Free": 0, "Pro": 20, "Max": 40, "Team": 30, "Enterprise": 60, "API direct": 0 }
  },
  "ChatGPT": {
    plans: { "Plus": 20, "Team": 30, "Enterprise": 60, "API direct": 0 }
  },
  "Anthropic API direct": {
    isApiOnly: true,
    plans: { "Pay-as-you-go": 0 }
  },
  "OpenAI API direct": {
    isApiOnly: true,
    plans: { "Pay-as-you-go": 0 }
  },
  "Gemini": {
    plans: { "Pro": 20, "Ultra": 30, "API": 0 }
  },
  "Windsurf": {
    plans: { "Hobby": 0, "Pro": 15, "Team": 25, "Enterprise": 50 }
  },
  "v0": {
    plans: { "Free": 0, "Premium": 20, "Team": 30 }
  }
};

// Normalization matchers
function getToolConfig(rawName: string) {
  const norm = rawName.toLowerCase().replace(/\s+/g, '');
  for (const [key, config] of Object.entries(PRICING_DB)) {
    if (key.toLowerCase().replace(/\s+/g, '') === norm) return { toolName: key, config };
  }
  return null;
}

function buildResult(tool: AuditInput, recPlan: string, recSpend: number, reason: string): AuditResult {
  const potentialSavings = Math.max(0, tool.monthlySpend - recSpend);
  const status = potentialSavings > 0 ? 'SAVINGS_FOUND' : 'OPTIMIZED';
  if (status === 'OPTIMIZED') reason = "Current setup looks optimized based on user count and standard pricing.";

  return {
    toolName: tool.toolName,
    currentPlan: tool.currentPlan,
    currentSpend: tool.monthlySpend,
    recommendedPlan: recPlan,
    recommendedSpend: recSpend,
    potentialSavings,
    yearlySavings: potentialSavings * 12,
    reason,
    status
  };
}

export function analyzeToolSpend(tool: AuditInput, context: AuditContext): AuditResult {
  const defaultOptimized = buildResult(tool, tool.currentPlan, tool.monthlySpend, "Optimized");
  const toolData = getToolConfig(tool.toolName);
  
  if (!toolData) return defaultOptimized; // Unrecognized tool, assume good.

  // 1. API Exclusions: Hard to audit strictly on user seat basis
  if (toolData.config.isApiOnly || tool.currentPlan.toLowerCase().includes("api")) {
    return defaultOptimized; 
  }

  const standardPrice = toolData.config.plans[tool.currentPlan] || 0;
  const isEnterprise = tool.currentPlan.toLowerCase().includes('enterprise');
  const isTeam = tool.currentPlan.toLowerCase().includes('team') || tool.currentPlan.toLowerCase().includes('business') || tool.currentPlan.toLowerCase().includes('max');

  // Cross-check 1: Use Case Mismatch (e.g., Writer paying for Cursor)
  if (context.primaryUseCase !== 'Coding' && context.primaryUseCase !== 'Mixed') {
    const isCodingTool = ['Cursor', 'GitHub Copilot', 'Windsurf', 'v0'].includes(toolData.toolName);
    if (isCodingTool) {
      return buildResult(tool, 'Cancel Plan', 0, `Your team is focused on ${context.primaryUseCase}, but you're paying for a heavy coding IDE tool. Consider cancelling to save cash.`);
    }
  }

  // Cross-check 2: Overspending Retail logic (Phantom seats or custom negotiation failure)
  const expectedSpend = standardPrice * tool.users;
  if (standardPrice > 0 && (tool.monthlySpend - expectedSpend) >= 15) {
    return buildResult(tool, tool.currentPlan, expectedSpend, `Significant overspend. Standard pricing is ~$${standardPrice}/mo. You may have unused seats or hidden fees.`);
  }

  // Cross-check 3: Phantom Seats globally vs team size
  if (tool.users > context.totalTeamSize) {
    const recSpend = standardPrice > 0 ? standardPrice * context.totalTeamSize : tool.monthlySpend * (context.totalTeamSize / tool.users);
    return buildResult(tool, tool.currentPlan, recSpend, `You have ${tool.users} seats assigned, but total team size is only ${context.totalTeamSize}. Trim the idle licenses.`);
  }

  // Cross-check 4: Enterprise Overkill
  if (isEnterprise && tool.users <= 5) {
    // Revert to Team
    const downGradeTiers = Object.entries(toolData.config.plans).filter(([n]) => n.toLowerCase().includes('team') || n.toLowerCase().includes('business') || n.toLowerCase().includes('pro'));
    if (downGradeTiers.length > 0) {
      const [recName, recPrice] = downGradeTiers[downGradeTiers.length - 1]; // closest high tier below
      return buildResult(tool, recName, recPrice * tool.users, `Enterprise plans are overkill for ${tool.users} users. Downgrading to ${recName} provides the same core model with lower fixed costs.`);
    }
  }

  // Cross-check 5: Team Unnecessary
  if (isTeam && tool.users <= 2) {
    const individualTiers = Object.entries(toolData.config.plans).filter(([, p]) => p > 0 && p <= 20); // Pro/Plus/Individual
    if (individualTiers.length > 0) {
      const [recName, recPrice] = individualTiers[individualTiers.length - 1];
      return buildResult(tool, recName, recPrice * tool.users, `Team features don't add enough ROI for 1-2 users. Switch to individual ${recName} subscriptions to save costs.`);
    }
  }

  return defaultOptimized;
}

export function runAuditCycle(inputs: AuditInput[], context: AuditContext): AuditResult[] {
  return inputs.map(input => analyzeToolSpend(input, context));
}
