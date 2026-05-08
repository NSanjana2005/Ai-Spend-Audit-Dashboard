import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI cost optimization expert helping startups reduce AI tooling expenses.",
        },
        {
          role: "user",
          content: `
Generate a short personalized audit summary.

Audit Data:
${JSON.stringify(body)}

Keep response under 100 words.
Mention savings opportunities naturally.
Be concise and professional.
          `,
        },
      ],
    });

    return Response.json({
      summary:
        completion.choices[0].message.content ||
        "No summary generated.",
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      summary:
        "Your AI stack has optimization opportunities based on team size and plan selection.",
    });
  }
}