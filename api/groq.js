import Groq from "groq-sdk";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const messages = req.body.messages;
    if (!messages) {
      return res.status(400).json({ error: "messages missing" });
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages,
      temperature: 0.8
    });

    const content = completion?.choices?.[0]?.message?.content;

    return res.status(200).json({
      choices: [
        {
          message: { content }
        }
      ]
    });
  } catch (err) {
    console.error("Proxy Error:", err);
    return res.status(500).json({
      error: "Groq Proxy Error",
      details: err.message
    });
  }
}
