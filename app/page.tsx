"use client";
import { useEffect, useState } from "react";

const TOOL_OPTIONS: Record<string, string[]> = {
  ChatGPT: ["Plus", "Team", "Enterprise", "API"],
  Claude: ["Free", "Pro", "Max", "Team", "Enterprise", "API"],
  Copilot: ["Individual", "Business", "Enterprise"],
  Cursor: ["Hobby", "Pro", "Business"],
};

type ToolType = {
  tool: string;
  plan: string;
  cost: string;
  users: string;
};

export default function Home() {
  const [teamSize, setTeamSize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [auditResult, setAuditResult] = useState<any>(null); // ✅ FIXED
  const [aiSummary, setAiSummary] = useState("");
  const [tools, setTools] = useState<ToolType[]>([
    { tool: "", plan: "", cost: "", users: "" },
  ]);

  const handleChange = (
    index: number,
    field: "tool" | "plan" | "cost" | "users",
    value: string
  ) => {
    const updated = [...tools];

    if (field === "tool") {
      updated[index] = {
        ...updated[index],
        tool: value,
        plan: "",
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }

    setTools(updated);
  };

  const addTool = () => {
    setTools([
      ...tools,
      { tool: "", plan: "", cost: "", users: "" },
    ]);
  };
  // 🔥 Load saved form data
  useEffect(() => {
    const savedData = localStorage.getItem("audit-form");

    if (savedData) {
      const parsed = JSON.parse(savedData);

      setTools(
        parsed.tools?.length
          ? parsed.tools
          : [{ tool: "", plan: "", cost: "", users: "" }]
      ); setTeamSize(parsed.teamSize || "");
      setUseCase(parsed.useCase || "");
      setAuditResult(parsed.auditResult || null);
    }
  }, []);

  // 🔥 Save form data automatically
  useEffect(() => {
    localStorage.setItem(
      "audit-form",
      JSON.stringify({
        tools,
        teamSize,
        useCase,
        auditResult,
      })
    );
  }, [tools, teamSize, useCase, auditResult]);
  const auditTools = (tools: ToolType[]) => {
    let results: any[] = [];
    let totalSavings = 0;

    tools.forEach((t) => {
      let savings = 0;
      let suggestion = "Looks fine";
      let reason = "You're already on a good plan";

      const users = Number(t.users);
      const cost = Number(t.cost);
      const totalCurrentCost = users * cost;

      // 🔹 ChatGPT Rule
      if (t.tool === "ChatGPT" && t.plan === "Team" && users <= 3) {
        const newCost = 20 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Switch to ChatGPT Plus";
        reason = "Small teams usually don't need Team plan";
      }

      // 🔹 Claude Rule
      if (t.tool === "Claude" && t.plan === "Team" && users <= 3) {
        const newCost = 20 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Use Claude Pro";
        reason = "Claude Team plan is expensive for small teams";
      }

      // 🔹 Copilot Rule
      if (
        t.tool === "Copilot" &&
        t.plan === "Business" &&
        users <= 2
      ) {
        const newCost = 10 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Switch to Copilot Individual";
        reason = "Business plan unnecessary for very small teams";
      }

      // 🔹 Cursor Rule
      if (
        t.tool === "Cursor" &&
        t.plan === "Business" &&
        users <= 2
      ) {
        const newCost = 20 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Switch to Cursor Pro";
        reason = "Business plan may be overkill";
      }

      // 🔹 Honest Result
      if (savings <= 0) {
        savings = 0;
        suggestion = "Current setup looks optimized";
        reason = "No obvious savings opportunity found";
      }

      totalSavings += savings;

      results.push({
        ...t,
        savings,
        suggestion,
        reason,
      });
    });

    return { results, totalSavings };
  };
  const generateSummary = (audit: any) => {
    if (audit.totalSavings > 500) {
      return `Your company appears to be overspending on AI tooling relative to team size. Several plans could be downgraded without significantly affecting productivity. Based on your current stack, optimizing subscriptions could save thousands annually while maintaining similar capabilities.`;
    }

    if (audit.totalSavings > 0) {
      return `Your AI stack has some optimization opportunities. A few tools appear slightly over-provisioned for your current team size and usage patterns. Small subscription adjustments could reduce monthly costs while keeping the same workflows intact.`;
    }

    return `Your current AI tooling setup appears well optimized. No major overspending opportunities were detected based on your selected tools, plans, and usage.`;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const audit = auditTools(tools);

    console.log(audit);

    setAuditResult(audit);

    // 🔥 Generate AI summary
    let summary = "";

    if (audit.totalSavings > 500) {
      summary =
        "Your company appears to be overspending on AI subscriptions relative to team size. Several tools could be downgraded to lower-cost plans while maintaining similar functionality. Optimizing your stack may significantly reduce annual AI expenses.";
    } else if (audit.totalSavings > 0) {
      summary =
        "Your AI stack has some optimization opportunities. A few plans appear more expensive than necessary for your current usage and team size. Minor adjustments could reduce costs without affecting productivity.";
    } else {
      summary =
        "Your current AI tooling setup appears well optimized. No major overspending opportunities were detected based on your selected tools and usage.";
    }

    setAiSummary(summary);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">
          AI Spend Audit
        </h2>

        {tools.map((t, index) => (
          <div key={index} className="mb-4 border p-3 rounded">

            {/* TOOL */}
            <select
              value={t.tool}
              onChange={(e) =>
                handleChange(index, "tool", e.target.value)
              }
              className="w-full mb-2 p-2 border rounded"
            >
              <option value="">Select Tool</option>
              {Object.keys(TOOL_OPTIONS).map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>

            {/* PLAN */}
            <select
              value={t.plan}
              onChange={(e) =>
                handleChange(index, "plan", e.target.value)
              }
              className="w-full mb-2 p-2 border rounded"
              disabled={!t.tool}
            >
              <option value="">
                {t.tool ? "Select Plan" : "Select Tool first"}
              </option>

              {(TOOL_OPTIONS[t.tool] || []).map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>

            {/* COST */}
            <input
              type="number"
              placeholder="Cost ($)"
              value={t.cost}
              onChange={(e) =>
                handleChange(index, "cost", e.target.value)
              }
              className="w-full mb-2 p-2 border rounded"
            />

            {/* USERS */}
            <input
              type="number"
              placeholder="Users"
              value={t.users}
              onChange={(e) =>
                handleChange(index, "users", e.target.value)
              }
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        {/* TEAM SIZE */}
        <input
          type="number"
          placeholder="Team Size"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* USE CASE */}
        <select
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="">Select Use Case</option>
          <option value="coding">Coding</option>
          <option value="writing">Writing</option>
          <option value="data">Data</option>
          <option value="research">Research</option>
          <option value="mixed">Mixed</option>
        </select>

        {/* ADD TOOL */}
        <button
          type="button"
          onClick={addTool}
          className="w-full mb-3 bg-gray-200 p-2 rounded"
        >
          + Add Another Tool
        </button>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Check Savings
        </button>
      </form>

      {/* RESULT UI */}
      {auditResult && (
        <div className="mt-6 w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">

          {/* HERO SECTION */}
          <div className="text-center border-b pb-6 mb-6">
            <p className="text-sm uppercase tracking-wide text-gray-500">
              Estimated Savings
            </p>

            <h2 className="text-5xl font-bold text-green-600 mt-2">
              ${auditResult.totalSavings}
              <span className="text-lg text-gray-500 font-medium">
                /month
              </span>
            </h2>

            <p className="text-gray-600 mt-2">
              ${(auditResult.totalSavings * 12).toLocaleString()} yearly savings
            </p>

            {auditResult.totalSavings >= 500 ? (
              <div className="mt-4 bg-green-100 text-green-800 p-3 rounded-lg text-sm">
                High savings opportunity detected. Credex could help reduce your AI infrastructure costs further.
              </div>
            ) : (
              <div className="mt-4 bg-blue-100 text-blue-800 p-3 rounded-lg text-sm">
                Your stack looks fairly optimized already.
              </div>
            )}
          </div>
          {/* AI SUMMARY */}
          <div className="mb-6 bg-gray-50 border rounded-xl p-4">
            <h3 className="font-semibold mb-2">
              🤖 AI Summary
            </h3>

            <p className="text-gray-700 text-sm leading-6">
              {aiSummary}
            </p>
          </div>
          {/* TOOL BREAKDOWN */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Audit Breakdown
            </h3>

            <div className="space-y-4">
              {auditResult.results.map((r: any, i: number) => (
                <div
                  key={i}
                  className="border rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {r.tool}
                      </h4>

                      <p className="text-sm text-gray-500">
                        Current Plan: {r.plan}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-green-600 font-bold text-lg">
                        ${r.savings}
                      </p>

                      <p className="text-xs text-gray-500">
                        monthly savings
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="font-medium">
                      💡 {r.suggestion}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      {r.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}