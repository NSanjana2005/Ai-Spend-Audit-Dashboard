"use client";
import { useState } from "react";

export default function Home() {
  const [tool, setTool] = useState("");
  const [plan, setPlan] = useState("");
  const [cost, setCost] = useState("");
  const [users, setUsers] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    alert(
      `Tool: ${tool}\nPlan: ${plan}\nCost: ${cost}\nUsers: ${users}`
    );
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

        <input
          type="text"
          placeholder="Tool (e.g. ChatGPT)"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Plan (e.g. Plus)"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Monthly Cost ($)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Number of Users"
          value={users}
          onChange={(e) => setUsers(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Check Savings
        </button>
      </form>
    </div>
  );
}