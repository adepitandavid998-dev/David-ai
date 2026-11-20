
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI key is missing from Vercel settings."
    });
  }

  const message = req.body?.message;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Please enter a message."
    });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          model: "gemini-3.8-flash",
          input:
            "You are DAVID AI, a helpful, friendly and intelligent assistant. Give clear, useful answers. Help with learning, explanations, coding and everyday questions.\n\nUser: " +
            message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "The AI service returned an error."
      });
    }

    const reply = data.output_text;

    if (!reply) {
      return res.status(502).json({
        error: "The AI returned an empty response. Please try again."
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      error: "Could not connect to DAVID AI. Please try again."
    });
  }
}
