import { GoogleGenAI, Type } from "@google/genai";
import type { Itinerary } from "@/lib/types";

export interface PlannerInput {
  location: string;
  time: string;
  budget: string;
  mood: string;
}

const MODEL = "gemini-2.5-flash";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    vibeSummary: { type: Type.STRING },
    totalDurationMin: { type: Type.INTEGER },
    budgetLevel: { type: Type.STRING },
    vibe: { type: Type.STRING },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          barName: { type: Type.STRING },
          address: { type: Type.STRING },
          arrivalOffsetMin: { type: Type.INTEGER },
          durationMin: { type: Type.INTEGER },
          recommendedOrder: {
            type: Type.OBJECT,
            properties: {
              drinkName: { type: Type.STRING },
              vibeExplanation: { type: Type.STRING },
            },
            required: ["drinkName", "vibeExplanation"],
          },
          quest: {
            type: Type.OBJECT,
            properties: {
              task: { type: Type.STRING },
              rewardPoints: { type: Type.INTEGER },
            },
            required: ["task", "rewardPoints"],
          },
        },
        required: ["barName", "address", "arrivalOffsetMin", "durationMin", "recommendedOrder", "quest"],
      },
    },
    storyFrames: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          frameNumber: { type: Type.INTEGER },
          headerText: { type: Type.STRING },
          caption: { type: Type.STRING },
          stickerIdea: { type: Type.STRING },
          bgGradient: { type: Type.STRING },
        },
        required: ["frameNumber", "headerText", "caption", "stickerIdea", "bgGradient"],
      },
    },
  },
  required: ["title", "vibeSummary", "totalDurationMin", "budgetLevel", "vibe", "itinerary", "storyFrames"],
};

function buildPrompt({ location, time, budget, mood }: PlannerInput): string {
  return `You are a nightlife concierge designing a bar crawl itinerary.

Starting location: ${location}
Start time: ${time}
Budget level: ${budget}
Mood/vibe: ${mood}

Design a 2-4 stop bar crawl that matches the mood and budget, starting near the given location at the given time. For each stop, invent a plausible bar name and a real-sounding street address near the starting location (do not fabricate GPS coordinates), a recommended drink with a short explanation tying it to the vibe, and a fun, low-effort social quest the group can complete there with a point reward. Also write 2-3 short Instagram-story-style frames (header, caption, an emoji sticker idea, and a Tailwind gradient class like "from-cyan-900 to-blue-950") recapping the night. budgetLevel should be one of "$", "$$", "$$$", "$$$$" matching the requested budget. Respond with JSON only, matching the provided schema.`;
}

const BUDGET_LEVELS = ["$", "$$", "$$$", "$$$$"];

function normalizeBudgetLevel(budget: string): string {
  return BUDGET_LEVELS.includes(budget) ? budget : "$$";
}

function buildMockItinerary({ location, time, budget, mood }: PlannerInput): Itinerary {
  const budgetLevel = normalizeBudgetLevel(budget);
  return {
    title: `${mood} Night in ${location}`,
    vibeSummary: `A ${budgetLevel} ${mood.toLowerCase()} crawl kicking off near ${location} at ${time}. (Demo data — no GEMINI_API_KEY set.)`,
    totalDurationMin: 180,
    budgetLevel,
    vibe: mood,
    itinerary: [
      {
        barName: "The Velvet Hour",
        address: `1-2-3 ${location}`,
        arrivalOffsetMin: 0,
        durationMin: 60,
        recommendedOrder: {
          drinkName: "Smoked Old Fashioned",
          vibeExplanation: `Eases the crew into the ${mood.toLowerCase()} mood with a slow-burn classic.`,
        },
        quest: { task: "Get the bartender to share their go-to off-menu order", rewardPoints: 10 },
      },
      {
        barName: "Neon Alley",
        address: `4-5-6 ${location}`,
        arrivalOffsetMin: 70,
        durationMin: 60,
        recommendedOrder: {
          drinkName: "Yuzu Highball",
          vibeExplanation: "A bright, fizzy palate reset for the second stop.",
        },
        quest: { task: "Take a group photo under the neon sign", rewardPoints: 15 },
      },
      {
        barName: "Rooftop Hideout",
        address: `7-8-9 ${location}`,
        arrivalOffsetMin: 140,
        durationMin: 40,
        recommendedOrder: {
          drinkName: "Sakura Sour",
          vibeExplanation: "A celebratory close-out drink with a view.",
        },
        quest: { task: "Toast the night and tag the next bar you'll hit", rewardPoints: 10 },
      },
    ],
    storyFrames: [
      {
        frameNumber: 1,
        headerText: "It begins...",
        caption: `Kicking off a ${mood.toLowerCase()} night near ${location} 🍸`,
        stickerIdea: "🍸",
        bgGradient: "from-cyan-900 to-blue-950",
      },
      {
        frameNumber: 2,
        headerText: "Stop 2: Neon Alley",
        caption: "Highballs and neon lights ✨",
        stickerIdea: "✨",
        bgGradient: "from-fuchsia-900 to-purple-950",
      },
      {
        frameNumber: 3,
        headerText: "Last call",
        caption: "Toasting to a night well spent 🌙",
        stickerIdea: "🌙",
        bgGradient: "from-amber-900 to-rose-950",
      },
    ],
  };
}

function assertIsItinerary(value: unknown): Itinerary {
  if (
    !value ||
    typeof value !== "object" ||
    !Array.isArray((value as Itinerary).itinerary) ||
    !Array.isArray((value as Itinerary).storyFrames)
  ) {
    throw new Error("Gemini response did not match the expected itinerary shape");
  }
  return value as Itinerary;
}

export async function generateItinerary(input: PlannerInput): Promise<Itinerary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set — returning mock itinerary");
    return buildMockItinerary(input);
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(input),
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return assertIsItinerary(JSON.parse(text));
}
