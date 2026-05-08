"use client";

import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

import {
  Sparkles,
  DollarSign,
  Bot,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";

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
  const [auditResult, setAuditResult] = useState<any>(null);

  const [aiSummary, setAiSummary] = useState("");

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const [tools, setTools] = useState<ToolType[]>([
    { tool: "", plan: "", cost: "", users: "" },
  ]);

  // LOAD SAVED DATA
  useEffect(() => {
    const savedData = localStorage.getItem("audit-form");

    if (savedData) {
      const parsed = JSON.parse(savedData);

      setTools(
        parsed.tools?.length
          ? parsed.tools
          : [{ tool: "", plan: "", cost: "", users: "" }]
      );

      setTeamSize(parsed.teamSize || "");
      setUseCase(parsed.useCase || "");
      setAuditResult(parsed.auditResult || null);
      setAiSummary(parsed.aiSummary || "");
    }
  }, []);

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem(
      "audit-form",
      JSON.stringify({
        tools,
        teamSize,
        useCase,
        auditResult,
        aiSummary,
      })
    );
  }, [tools, teamSize, useCase, auditResult, aiSummary]);

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
      {
        tool: "",
        plan: "",
        cost: "",
        users: "",
      },
    ]);
  };

  // AUDIT ENGINE
  const auditTools = (tools: ToolType[]) => {
    let results: any[] = [];
    let totalSavings = 0;

    tools.forEach((t) => {
      let savings = 0;

      let suggestion = "Current setup looks optimized";

      let reason =
        "No major savings opportunity detected.";

      const users = Number(t.users);

      const cost = Number(t.cost);

      const totalCurrentCost = users * cost;

      // ChatGPT
      if (
        t.tool === "ChatGPT" &&
        t.plan === "Team" &&
        users <= 3
      ) {
        const newCost = 20 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Switch to ChatGPT Plus";

        reason =
          "Small teams usually don't need Team plan.";
      }

      // Claude
      if (
        t.tool === "Claude" &&
        t.plan === "Team" &&
        users <= 3
      ) {
        const newCost = 20 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Use Claude Pro";

        reason =
          "Claude Team pricing is expensive for small teams.";
      }

      // Copilot
      if (
        t.tool === "Copilot" &&
        t.plan === "Business" &&
        users <= 2
      ) {
        const newCost = 10 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Use Copilot Individual";

        reason =
          "Business plan may be unnecessary.";
      }

      // Cursor
      if (
        t.tool === "Cursor" &&
        t.plan === "Business" &&
        users <= 2
      ) {
        const newCost = 20 * users;

        savings = totalCurrentCost - newCost;

        suggestion = "Switch to Cursor Pro";

        reason =
          "Business plan may be overkill.";
      }

      if (savings < 0) savings = 0;

      totalSavings += savings;

      results.push({
        ...t,
        savings,
        suggestion,
        reason,
      });
    });

    return {
      results,
      totalSavings,
    };
  };

  // SUBMIT
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    const audit = auditTools(tools);

    setAuditResult(audit);

    try {
      const response = await fetch(
        "/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(audit),
        }
      );

      const data = await response.json();

      setAiSummary(data.summary);
    } catch (error) {
      console.error(error);

      if (audit.totalSavings > 0) {
        setAiSummary(
          `Your team could save approximately $${audit.totalSavings} monthly by optimizing AI plan selection and removing unnecessary upgrades.`
        );
      } else {
        setAiSummary(
          "Your current AI stack appears cost-efficient based on your selected tools and usage."
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="flex flex-col justify-center">

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm mb-4">
              <Sparkles size={16} />
              AI Spend Optimizer
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
              Stop Overpaying
              <br />
              for AI Tools
            </h1>

            <p className="text-gray-600 mt-5 text-lg leading-8">
              Instantly audit ChatGPT, Claude,
              Cursor, Copilot and more.
              Discover hidden savings in under
              60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white rounded-2xl p-5 shadow-sm border">
              <DollarSign className="mb-3 text-green-600" />
              <h3 className="font-semibold">
                Cost Optimization
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Find unnecessary AI spending.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border">
              <TrendingDown className="mb-3 text-blue-600" />
              <h3 className="font-semibold">
                Instant Savings
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Compare cheaper alternatives.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border">
              <Bot className="mb-3 text-purple-600" />
              <h3 className="font-semibold">
                AI Insights
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Personalized audit summary.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border">
              <ShieldCheck className="mb-3 text-orange-600" />
              <h3 className="font-semibold">
                Honest Recommendations
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                No fake savings calculations.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8"
          >
            <h2 className="text-3xl font-bold mb-2">
              Run Free Audit
            </h2>

            <p className="text-gray-500 mb-6">
              Analyze your AI tool spending.
            </p>

            {tools.map((t, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl p-4 mb-4 bg-gray-50"
              >

                <select
                  value={t.tool}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "tool",
                      e.target.value
                    )
                  }
                  className="w-full mb-3 border rounded-xl p-3"
                >
                  <option value="">
                    Select Tool
                  </option>

                  {Object.keys(
                    TOOL_OPTIONS
                  ).map((tool) => (
                    <option
                      key={tool}
                      value={tool}
                    >
                      {tool}
                    </option>
                  ))}
                </select>

                <select
                  value={t.plan}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "plan",
                      e.target.value
                    )
                  }
                  disabled={!t.tool}
                  className="w-full mb-3 border rounded-xl p-3"
                >
                  <option value="">
                    {t.tool
                      ? "Select Plan"
                      : "Select Tool first"}
                  </option>

                  {(TOOL_OPTIONS[t.tool] ||
                    []).map((plan) => (
                    <option
                      key={plan}
                      value={plan}
                    >
                      {plan}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">

                  <input
                    type="number"
                    placeholder="Cost ($)"
                    value={t.cost}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "cost",
                        e.target.value
                      )
                    }
                    className="border rounded-xl p-3"
                  />

                  <input
                    type="number"
                    placeholder="Users"
                    value={t.users}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "users",
                        e.target.value
                      )
                    }
                    className="border rounded-xl p-3"
                  />
                </div>
              </div>
            ))}

            <input
              type="number"
              placeholder="Team Size"
              value={teamSize}
              onChange={(e) =>
                setTeamSize(e.target.value)
              }
              className="w-full border rounded-xl p-3 mb-3"
            />

            <select
              value={useCase}
              onChange={(e) =>
                setUseCase(e.target.value)
              }
              className="w-full border rounded-xl p-3 mb-4"
            >
              <option value="">
                Select Use Case
              </option>

              <option value="coding">
                Coding
              </option>

              <option value="writing">
                Writing
              </option>

              <option value="data">
                Data
              </option>

              <option value="research">
                Research
              </option>

              <option value="mixed">
                Mixed
              </option>
            </select>

            <button
              type="button"
              onClick={addTool}
              className="w-full border border-gray-300 rounded-xl p-3 mb-4 hover:bg-gray-50 transition"
            >
              + Add Another Tool
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-black to-gray-700 text-white rounded-xl p-4 font-semibold hover:opacity-90 transition"
            >
              {loading
                ? "Analyzing..."
                : "Check Savings"}
            </button>
          </form>
        </div>
      </div>

      {/* RESULTS */}
      {auditResult && (
        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl border p-8">

          <div className="text-center border-b pb-8">

            <p className="uppercase text-sm tracking-wider text-gray-500">
              Estimated Savings
            </p>

            <h2 className="text-6xl font-extrabold text-green-600 mt-3">
              ${auditResult.totalSavings}
            </h2>

            <p className="text-xl font-semibold text-gray-700 mt-3">
              ${(auditResult.totalSavings * 12).toLocaleString()} yearly savings
            </p>

            {auditResult.totalSavings === 0 ? (
              <div className="mt-5 bg-green-100 text-green-800 rounded-2xl p-4">
                Your AI stack is already well optimized.
              </div>
            ) : (
              <div className="mt-5 bg-blue-100 text-blue-800 rounded-2xl p-4">
                Optimization opportunities detected.
              </div>
            )}
          </div>

          {/* AI SUMMARY */}
          <div className="mt-8 bg-gray-50 border rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">
              🤖 AI Summary
            </h3>

            <p className="text-gray-700 leading-7">
              {aiSummary}
            </p>
          </div>

          {/* BREAKDOWN */}
          <div className="mt-8">

            <h3 className="text-2xl font-bold mb-5">
              Audit Breakdown
            </h3>

            <div className="space-y-4">
              {auditResult.results.map(
                (r: any, i: number) => (
                  <div
                    key={i}
                    className="border rounded-2xl p-5 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">

                      <div>
                        <h4 className="text-xl font-semibold">
                          {r.tool}
                        </h4>

                        <p className="text-gray-500">
                          Current Plan: {r.plan}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${r.savings}
                        </p>

                        <p className="text-sm text-gray-500">
                          monthly savings
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold">
                        💡 {r.suggestion}
                      </p>

                      <p className="text-gray-600 mt-1">
                        {r.reason}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* CREDEX CTA */}
          {auditResult.totalSavings >= 500 && (
            <div className="mt-8 bg-black text-white rounded-3xl p-8">
              <h3 className="text-3xl font-bold mb-3">
                Reduce Costs Even Further
              </h3>

              <p className="text-gray-300 mb-5">
                Credex helps startups access discounted AI infrastructure credits.
              </p>

              <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold">
                Book Credex Consultation
              </button>
            </div>
          )}

          {/* EMAIL */}
          <div className="mt-10 border-t pt-8">

            <h3 className="text-2xl font-bold mb-2">
              Save Full Report
            </h3>

            <p className="text-gray-500 mb-5">
              Receive future optimization updates.
            </p>

            <div className="space-y-4">

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              />

              <input
                type="text"
                placeholder="Company Name (optional)"
                value={company}
                onChange={(e) =>
                  setCompany(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              />

              <input
                type="text"
                placeholder="Role (optional)"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              />

              <button
                className="w-full bg-black text-white rounded-xl p-4 font-semibold hover:bg-gray-800 transition"
                onClick={async () => {
                  if (!email) {
                    alert("Email is required");
                    return;
                  }

                  const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                  if (
                    !emailRegex.test(email)
                  ) {
                    alert(
                      "Enter valid email"
                    );
                    return;
                  }

                  const { error } =
                    await supabase
                      .from("leads")
                      .insert([
                        {
                          email,
                          company,
                          role,
                          audit: auditResult,
                        },
                      ]);

                  if (error) {
                    alert(
                      "Failed to save"
                    );

                    return;
                  }

                  alert(
                    "Report saved successfully!"
                  );
                }}
              >
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}