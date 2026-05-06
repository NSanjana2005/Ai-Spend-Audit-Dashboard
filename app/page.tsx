"use client";
import { useState } from "react";

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

  const auditTools = (tools: ToolType[]) => {
    let results: any[] = [];
    let totalSavings = 0;

    tools.forEach((t) => {
      let savings = 0;
      let suggestion = "Looks fine";
      let reason = "You're on a reasonable plan";

      const users = Number(t.users);
      const cost = Number(t.cost);

      if (t.tool === "ChatGPT" && t.plan === "Team" && users <= 3) {
        const newCost = 20 * users;
        const currentCost = cost * users;
        savings = currentCost - newCost;

        suggestion = "Switch to ChatGPT Plus";
        reason = "Team plan is expensive for small teams";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const audit = auditTools(tools);
    console.log(audit);

    setAuditResult(audit);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      
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
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md w-96">
          <h2 className="text-xl font-bold mb-3 text-center">
            Your Savings
          </h2>

          <p className="text-2xl font-bold text-green-600 text-center">
            ${auditResult.totalSavings}/month
          </p>

          <div className="mt-4">
            {auditResult.results.map((r: any, i: number) => (
              <div key={i} className="border p-3 rounded mb-2">
                <p><b>{r.tool}</b> ({r.plan})</p>
                <p>💡 {r.suggestion}</p>
                <p className="text-sm text-gray-600">{r.reason}</p>
                <p className="text-green-600">
                  Save: ${r.savings}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}