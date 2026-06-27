import { GoogleGenAI, Type, createPartFromBase64, createUserContent } from "@google/genai";
import type { Itinerary, StoryCard } from "@/lib/types";

export interface StoryPhoto {
  base64: string;
  mimeType: string;
}

export interface StoryCardInput {
  itinerary: Itinerary;
  visitedPlaces: string[];
  photos: StoryPhoto[];
}

const MODEL = "gemini-2.5-flash";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    caption: { type: Type.STRING },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["title", "subtitle", "caption", "hashtags"],
};

function buildPrompt({ itinerary, visitedPlaces }: StoryCardInput): string {
  const placesList = visitedPlaces.length > 0 ? visitedPlaces.join(", ") : "the planned stops";

  return `You are writing the copy for an Instagram recap card celebrating a nightlife bar crawl that just happened.

Crawl theme: ${itinerary.vibe} (${itinerary.title})
Vibe summary: ${itinerary.vibeSummary}
Places actually visited tonight: ${placesList}
${itinerary.itinerary.length > 0 ? `Full planned itinerary for context: ${itinerary.itinerary.map((bar) => `${bar.barName} (${bar.recommendedOrder.drinkName})`).join("; ")}` : ""}

If photos are attached, look at them and reference what you actually see (mood, lighting, drinks, people, setting) in the caption.

Write a short, punchy Instagram-ready recap with:
- title: a bold 2-5 word headline for the night
- subtitle: a short one-line tagline that adds context (e.g. the route or vibe)
- caption: a fun 1-3 sentence Instagram caption recapping the night, written in first person plural ("we"), referencing the visited places naturally
- hashtags: 5-8 relevant hashtags (no spaces, include the # symbol, mix of vibe/location/nightlife tags)

Respond with JSON only, matching the provided schema.`;
}

function buildMockStoryCard({ itinerary, visitedPlaces }: StoryCardInput): StoryCard {
  const places = visitedPlaces.length > 0 ? visitedPlaces : itinerary.itinerary.map((bar) => bar.barName);
  const hashtag = `#${itinerary.vibe.replace(/\s+/g, "")}`;

  return {
    title: `${itinerary.vibe} Recap`,
    subtitle: `${places.length} stops, one unforgettable night`,
    caption: `We hit up ${places.join(", ")} and turned "${itinerary.title}" into a night to remember 🍸 (Demo data — no GEMINI_API_KEY set.)`,
    hashtags: [hashtag, "#nightlife", "#barcrawl", "#instagood", "#nightout"],
  };
}

function assertIsStoryCard(value: unknown): StoryCard {
  const card = value as StoryCard;
  if (
    !card ||
    typeof card !== "object" ||
    typeof card.title !== "string" ||
    typeof card.subtitle !== "string" ||
    typeof card.caption !== "string" ||
    !Array.isArray(card.hashtags)
  ) {
    throw new Error("Gemini response did not match the expected story card shape");
  }
  return card;
}

export async function generateStoryCard(input: StoryCardInput): Promise<StoryCard> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set — returning mock story card");
    return buildMockStoryCard(input);
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts = [
    buildPrompt(input),
    ...input.photos.map((photo) => createPartFromBase64(photo.base64, photo.mimeType)),
  ];

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: createUserContent(parts),
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return assertIsStoryCard(JSON.parse(text));
}
