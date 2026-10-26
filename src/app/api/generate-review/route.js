import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

function generateFallbackReviews(businessName, rating) {
  const business = businessName || "this business";

  const templates = {
    1: [
      `My experience with ${business} did not meet my expectations. I would have appreciated a better overall experience. I hope the business takes customer feedback seriously and makes improvements.`,
      `I was disappointed with my overall experience with ${business}. There is room for improvement in the areas that matter most to customers. I hope future experiences are better.`,
      `My experience with ${business} was below what I expected. I would like to see improvements in the overall customer experience and how concerns are addressed.`,
      `I cannot say I was satisfied with my experience with ${business}. I hope the team reviews customer feedback and works toward providing a better experience.`,
      `Overall, my experience with ${business} was disappointing. I believe improvements could make a meaningful difference to future customers.`,
    ],
    2: [
      `My experience with ${business} was below expectations in some areas. There is potential for improvement, and I hope the business considers customer feedback.`,
      `I had a mixed experience with ${business}, but some aspects could have been better. Improving consistency and the overall customer experience would help.`,
      `My overall experience with ${business} was not as positive as I had hoped. A few improvements could make the experience more satisfying for customers.`,
      `There is room for ${business} to improve its overall customer experience. I hope the business takes feedback into consideration and continues working on its service.`,
      `My experience with ${business} was somewhat disappointing. With more attention to customer expectations, the overall experience could improve.`,
    ],
    3: [
      `My experience with ${business} was average overall. There were some positives, but there is still room to improve the customer experience.`,
      `I had a reasonably satisfactory experience with ${business}. A few improvements could make the overall experience more consistent and enjoyable.`,
      `My experience with ${business} was fair. I appreciate the positive aspects, although some areas could benefit from further improvement.`,
      `Overall, my experience with ${business} was okay. With some attention to customer feedback, the business could provide a better experience.`,
      `I found my experience with ${business} acceptable overall. There is potential to improve consistency and customer satisfaction.`,
    ],
    4: [
      `I had a good experience with ${business}. Overall, I was satisfied, and a few small improvements could make the experience even better.`,
      `My experience with ${business} was positive overall. I appreciated the general experience and would like to see the same level of consistency going forward.`,
      `Overall, I was pleased with my experience with ${business}. There is always room for improvement, but my general impression was good.`,
      `I had a satisfying experience with ${business}. Continued attention to customer needs could make the experience even better.`,
      `My overall impression of ${business} was good. I appreciate a positive customer experience and hope the business continues improving its service.`,
    ],
    5: [
      `I had an excellent experience with ${business}. Overall, I was very satisfied, and my impression of the business was highly positive.`,
      `My experience with ${business} was very positive. I appreciate businesses that focus on customer satisfaction and maintaining a good overall experience.`,
      `I am very happy with my overall experience with ${business}. The experience left me with a positive impression of the business.`,
      `Overall, I had a great experience with ${business}. I appreciate the positive experience and would be happy to consider this business again.`,
      `My overall experience with ${business} was excellent. I was very satisfied with my experience and have a positive impression of the business.`,
    ],
  };

  return templates[rating] || templates[5];
}

async function generateWithRetry(prompt, maxRetries = 2) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 2048,
        stream: false,
      });

      return completion.choices[0]?.message?.content?.trim();
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      // Exponential backoff: 500ms, 1000ms
      await new Promise((res) => setTimeout(res, attempt * 500));
    }
  }
}

export async function POST(req) {
  let businessName = "";
  let rating = 5;

  try {
    const body = await req.json();

    const {
      location,
      description,
      services,
      industry,
      stars,
      customerExperience,
    } = body;

    businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required." },
        { status: 400 }
      );
    }

    rating = Number(stars);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Star rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json({
        reviews: generateFallbackReviews(businessName, rating),
        source: "fallback",
        warning: "AI service key missing. Personalize these templates.",
      });
    }

    const prompt = `
You are a review writing assistant. Generate exactly 5 distinct, natural review drafts for a customer to edit.
Return ONLY valid raw JSON with no explanation or extra text.

Business: ${businessName}
Location: ${location || "Not specified"}
Industry: ${industry || "Not specified"}
Description: ${description || "Not specified"}
Services: ${services || "Not specified"}
Customer's own experience: ${customerExperience || "Not provided"}
Requested rating: ${rating}/5

JSON Schema:
{
  "reviews": [
    "review 1 string",
    "review 2 string",
    "review 3 string",
    "review 4 string",
    "review 5 string"
  ]
}

Constraints:
- Array must have exactly 5 review strings.
- Match tone to ${rating}/5 stars.
- Do not invent staff names, false events, or specific unverified details.
- Length: 30 to 70 words per review.
`;

    const rawText = await generateWithRetry(prompt);

    if (!rawText) {
      throw new Error("API returned an empty response.");
    }

    // Strip markdown code fences (```json ... ```) if the model wraps the output
    const cleanJson = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
    const parsed = JSON.parse(cleanJson);

    if (
      !Array.isArray(parsed.reviews) ||
      parsed.reviews.length !== 5 ||
      !parsed.reviews.every((review) => typeof review === "string" && review.trim())
    ) {
      throw new Error("Model returned invalid reviews payload structure.");
    }

    return NextResponse.json({
      reviews: parsed.reviews.map((r) => r.trim()),
      source: "nvidia-ai",
      business: {
        name: businessName,
        location,
        industry,
        stars: rating,
      },
    });
  } catch (error) {
    const status = Number(error.status ?? error.code);

    console.error("[GENERATE REVIEW] Failed:", {
      status,
      message: error.message,
    });

    // Upstream rate limit or server errors -> graceful fallback
    if ([429, 500, 502, 503, 504].includes(status)) {
      return NextResponse.json({
        reviews: generateFallbackReviews(businessName, rating),
        source: "fallback",
        warning:
          "AI is temporarily unavailable. Please edit these templates to reflect your actual experience.",
      });
    }

    return NextResponse.json(
      {
        error: "Unable to generate review suggestions.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}