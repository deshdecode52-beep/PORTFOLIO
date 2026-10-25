// Vercel serverless function for Groq.
// Configure GROQ_API_KEY in Vercel environment variables.
// Never commit your API key to GitHub.

const portfolioContext = `
You are the AI assistant on Dhruv Gupta's student portfolio.

Answer accurately and concisely using the information below.
Do not invent achievements, credentials, or project features.
If a detail is missing, say that you don't have that information.

ABOUT:
Dhruv Gupta is a Computer Science Engineering student at JECRC
University in Jaipur, India.

INTERESTS:
Software development, problem-solving, programming fundamentals,
data structures and algorithms, and backend development.

SKILLS:
C++, DSA, HTML, CSS, JavaScript, Java, React, Node.js, Express,
MongoDB, Git, GitHub, Python, and TypeScript.

PROJECTS:

1. SafeRoute:
A safety-aware pedestrian navigation concept focused on Jaipur.
It explores pedestrian route planning and safety-related information.
Technologies include React, TypeScript, Node.js, Express, and Leaflet.
Repository: https://github.com/deshdecode52-beep/MESSY

2. Quiz project:
The repository supplied for this entry is QUIZ_25BCON1090.
Use this description cautiously because the detailed implementation
has not yet been verified.
Repository: https://github.com/deshdecode52-beep/QUIZ_25BCON1090

3. Python Programs Collection:
Includes a factorial program, Fibonacci sequence generator, and
conversion of a Python dataclass object into a dictionary.
Repository:
https://github.com/deshdecode52-beep/Python-program-collection

4. BUG-FIX:
A debugging and testing assignment repository involving code review,
documented issues, and tests.
Repository: https://github.com/deshdecode52-beep/BUG-FIX

5. Reading List:
A reading-list project for organising books and tracking reading.
Its exact functionality has not been verified.
Repository: https://github.com/deshdecode52-beep/READING-LIST

GitHub profile:
https://github.com/deshdecode52-beep
`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Use POST to ask the portfolio assistant a question."
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error:
        "The chatbot API key is not configured. Add GROQ_API_KEY to your Vercel environment variables and redeploy."
    });
  }

  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message) {
    return res.status(400).json({
      error: "Please enter a question."
    });
  }

  if (message.length > 500) {
    return res.status(400).json({
      error: "Please keep your question under 500 characters."
    });
  }

  const history = Array.isArray(req.body?.history)
    ? req.body.history
      .filter(
        (item) =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
      )
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 1500)
      }))
    : [];

  try {
    const upstream = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: portfolioContext
            },
            ...history,
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.3,
          max_tokens: 600
        })
      }
    );

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      console.error(
        "Groq API request failed:",
        upstream.status,
        payload?.error?.message || "Unknown API error"
      );

      return res.status(502).json({
        error:
          "The AI provider could not answer right now. Check your Groq API key, model availability, and quota, then try again."
      });
    }

    const reply =
      payload?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error:
          "The AI provider returned an empty response. Please try again."
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat endpoint error:", error);

    return res.status(500).json({
      error:
        "The chatbot encountered a server error. Please try again later."
    });
  }
};

