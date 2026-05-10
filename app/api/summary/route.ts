import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  const openai = getOpenAI();

  if (!openai) {
    return NextResponse.json(
      { error: "Missing API key" },
      { status: 200 }
    );
  }

  const body = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: body.prompt }
    ],
  });

  return NextResponse.json({
    result: response.choices[0]?.message?.content,
  });
}