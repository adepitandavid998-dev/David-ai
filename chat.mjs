
export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "POST requests only." },
      { status: 405 }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const googleResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text:
                "You are DAVID AI, a helpful personal digital assistant. " +
                "Answer clearly and naturally. Help with learning, " +
                "coding, explanations and everyday questions.\n\n" +
                message
            }]
          }]
        })
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return Response.json(
        {
          error:
            data.error?.message ||
            "Gemini could not process your request."
        },
        { status: googleResponse.status }
      );
    }

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      return Response.json(
        { error: "DAVID AI received an empty answer." },
        { status: 502 }
      );
    }

    return Response.json({ reply });

  } catch (error) {
    return Response.json(
      { error: "Unable to connect to DAVID AI." },
      { status: 500 }
    );
  }
};
