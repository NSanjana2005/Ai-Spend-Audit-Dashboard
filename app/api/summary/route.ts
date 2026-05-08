import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    const body = await req.json();
    try {
        

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
        console.error("OPENAI ERROR:", error);

        const savings =
            body?.totalSavings || 0;

        let fallbackSummary =
            "Your AI stack has optimization opportunities based on current usage.";

        if (savings > 500) {
            fallbackSummary =
                "Your company appears to be significantly overspending on AI tooling. Several plans seem over-provisioned relative to team size, and optimizing subscriptions could reduce annual costs substantially while maintaining similar productivity.";
        } else if (savings > 0) {
            fallbackSummary =
                "Your AI tooling setup has moderate optimization opportunities. A few subscriptions appear more expensive than necessary for your current usage and team structure.";
        } else {
            fallbackSummary =
                "Your current AI stack appears well optimized. No major savings opportunities were detected based on the provided plans, users, and usage patterns.";
        }

        return Response.json({
            summary: fallbackSummary,
        });
    }
}