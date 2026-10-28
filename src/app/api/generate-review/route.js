
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 25000,
  maxRetries: 0,
});

function getSafeText(value, maxLength = 1000) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function getErrorStatus(error) {
  const status = Number(error?.status);

  if (status === 401 || status === 403) return status;
  if (status === 429) return 429;
  if ([400, 404, 422].includes(status)) return status;
  if (status === 408 || error?.name === "APIConnectionTimeoutError") {
    return 504;
  }

  return 502;
}

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const businessName = getSafeText(body.businessName, 150);
    const location = getSafeText(body.location, 200);
    const description = getSafeText(body.description, 1000);
    const services = getSafeText(body.services, 1000);
    const industry = getSafeText(body.industry, 150);
    // const customerExperience = getSafeText(body.customerExperience, 1500);
    const rating = Number(body.stars);

    if (!businessName) {
      return NextResponse.json(
        { success: false, error: "Business name is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { success: false, error: "Star rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    // if (!customerExperience) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Please describe your actual customer experience.",
    //     },
    //     { status: 400 }
    //   );
    // }
// Customer's actual experience: ${customerExperience}
  
const prompt = `
Generate exactly 5 complete, natural-sounding customer review drafts.

Business name: ${businessName}
Location: ${location || "Not provided"}
Industry: ${industry || "Not provided"}
Business description: ${description || "Not provided"}
Services: ${services || "Not provided"}

Requested rating: ${rating}/5 stars

Return ONLY a valid JSON object:
{
  "reviews": [
    "First complete review",
    "Second complete review",
    "Third complete review",
    "Fourth complete review",
    "Fifth complete review"
  ]
}

STRICT RULES:
- Generate exactly 5 complete reviews.
- Each review should contain 25-50 words.
- Write fluent, natural English that sounds like a real customer.
- Never use placeholders such as [dish], [item], [detail], or fill-in instructions.

- Do not ask the customer to complete or edit missing details.

- Use the business name naturally, without unnecessarily repeating its location.

- Make all five reviews meaningfully different.
- Match the requested rating without exaggeration.
- Return valid JSON only, with no markdown or additional text.
`;
const systemPrompt = `You are an everyday customer writing quick, authentic reviews on Google Maps. Write exactly how real people talk online: casual, direct, and conversational. Never use corporate buzzwords or PR speak. Always return raw, valid JSON only.`;


const userPrompt = `
Generate 5 ready-to-post customer reviews for this business:

- Business: ${businessName}
- Location: ${location || "Local"}
- Industry: ${industry || "Service"}
- What they do: ${description || "General services"}
- Specific services offered: ${services || "Various services"}
- Rating: ${rating}/5 stars

JSON FORMAT TO RETURN:
{
  "reviews": [
    "Review text here",
    "Review text here",
    "Review text here",
    "Review text here",
    "Review text here"
  ]
}

RULES FOR REAL-LOOKING USER REVIEWS:
1. Ready to Copy-Paste: The customer should be able to just copy this and hit submit. No placeholders like "[service]" or "[name]".
2. Word Count: 25 to 45 words each. Short, punchy, and readable.
3. Natural Human Tone:
   - Sound like a real person writing on their phone.
   - Use casual phrases like: "super helpful", "quick turnaround", "definitely coming back", "fair price", "easy process".
   - Avoid marketing jargon (do NOT use words like "unparalleled", "testament", "seamless synergy", "meticulous attention").
4. Different Vibes for Each:
   - 1st: Short & sweet, straight to the point.
   - 2nd: Focused on how friendly or helpful the team was.
   - 3rd: Focused on quick service / fast delivery.
   - 4th: Focused on good value / fair pricing.
   - 5th: From someone who says they will definitely come back or recommend to friends.
5. Rating Match (${rating}/5):
   - 5 stars: Happy, satisfied, direct recommendation.
   - 4 stars: Mostly positive with a small realistic detail (e.g., "a bit busy, but worth it").
   - 1-3 stars: Honest feedback matching the lower score.
6. Clean Output: Raw JSON only. No markdown formatting (\`\`\`json) or extra explanation.
`;



    let response;

    try {
      response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:systemPrompt      },
          {
            role: "user",
            content: userPrompt,
          },
        ],
     
        max_completion_tokens: 1200,
        response_format: {
          type: "json_object",
        },
      });
    } catch (error) {
      console.error("[OPENAI API ERROR]", {
        status: error.status,
        code: error.code,
        type: error.type,
        message: error.message,
      });

      const status = getErrorStatus(error);

      const message =
        status === 401
          ? "OpenAI API key is invalid or unauthorized."
          : status === 403
            ? "OpenAI access is forbidden. Check your project permissions."
            : status === 429
              ? "OpenAI rate limit or quota exceeded. Check your API billing and usage limits."
              : status === 504
                ? "OpenAI request timed out. Please try again."
                : "OpenAI could not generate reviews. Please try again.";

      return NextResponse.json(
        {
          success: false,
          source: "openai",
          error: message,
          ...(process.env.NODE_ENV === "development"
            ? { details: error.message }
            : {}),
        },
        { status }
      );
    }

    const rawText = response.choices?.[0]?.message?.content;

    if (!rawText) {
      console.error("[OPENAI ERROR] Empty response", {
        finishReason: response.choices?.[0]?.finish_reason,
      });

      return NextResponse.json(
        {
          success: false,
          source: "openai",
          error: "OpenAI returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("[OPENAI ERROR] Invalid JSON response");

      return NextResponse.json(
        {
          success: false,
          source: "openai",
          error: "OpenAI returned an invalid response. Please try again.",
        },
        { status: 502 }
      );
    }

    if (
      !Array.isArray(parsed.reviews) ||
      parsed.reviews.length !== 5 ||
      !parsed.reviews.every(
        (review) =>
          typeof review === "string" &&
          review.trim().length > 0 &&
          review.trim().length <= 1500
      )
    ) {
      console.error("[OPENAI ERROR] Invalid reviews structure");

      return NextResponse.json(
        {
          success: false,
          source: "openai",
          error: "OpenAI returned invalid review data. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      source: "openai",
      reviews: parsed.reviews.map((review) => review.trim()),
      business: {
        name: businessName,
        location,
        industry,
        stars: rating,
      },
    });
  } catch (error) {
    console.error("[GENERATE REVIEW ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to process your request.",
      },
      { status: 500 }
    );
  }
}
