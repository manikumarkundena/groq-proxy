export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json",
  };

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: cors,
    });
  }

  try {
    const body = await req.json();

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: body.messages
      })
    });

    const result = await groqRes.json();

    // ⭐ FIX: Normalize ALL responses into ONE clean format for chat.js
    const finalContent =
      result?.choices?.[0]?.message?.content ||
      result?.content ||
      (Array.isArray(result?.content) ? result.content.map(c => c.text).join("\n") : null);

    return new Response(
      JSON.stringify({
        choices: [
          { message: { content: finalContent || "⚠️ AI Error: Empty response" } }
        ]
      }),
      { status: 200, headers: cors }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: cors,
    });
  }
}
