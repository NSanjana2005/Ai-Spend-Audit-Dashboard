"use client";
import { useState } from "react";
const TOOL_OPTIONS = {
  ChatGPT: ["Plus", "Team", "Enterprise", "API"],
  Claude: ["Free", "Pro", "Max", "Team", "Enterprise", "API"],
  Copilot: ["Individual", "Business", "Enterprise"],
  Cursor: ["Hobby", "Pro", "Business"],
};
export default function Home() {
  const [teamSize, setTeamSize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [tools, setTools] = useState([
    { tool: "", plan: "", cost: "", users: "" },
  ]);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...tools];
    updated[index][field as keyof typeof updated[0]] = value;
    setTools(updated);
  };

  const addTool = () => {
    setTools([...tools, { tool: "", plan: "", cost: "", users: "" }]);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const finalData = {
      tools,
      teamSize,
      useCase,
    };

    console.log(finalData);
    alert("Check console for full data");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">
          AI Spend Audit
        </h2>

        {tools.map((t, index) => (
          <div key={index} className="mb-4 border p-3 rounded">
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
            <select
              value={t.plan}
              onChange={(e) =>
                handleChange(index, "plan", e.target.value)
              }
              className="w-full mb-2 p-2 border rounded"
            >
              <option value="">Select Plan</option>
              {t.tool &&
                TOOL_OPTIONS[t.tool as keyof typeof TOOL_OPTIONS]?.map(
                  (plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  )
                )}
            </select>
            <input
              type="number"
              placeholder="Cost ($)"
              value={t.cost}
              onChange={(e) =>
                handleChange(index, "cost", e.target.value)
              }
              className="w-full mb-2 p-2 border rounded"
            />

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
        <input
          type="number"
          placeholder="Team Size"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

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
        <button
          type="button"
          onClick={addTool}
          className="w-full mb-3 bg-gray-200 p-2 rounded"
        >
          + Add Another Tool
        </button>

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Check Savings
        </button>
      </form>
    </div>
  );
}