import { generateStoryCard, StoryPhoto } from "@/lib/storyCardGenerator";
import type { Itinerary } from "@/lib/types";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

function isValidItinerary(value: unknown): value is Itinerary {
  if (!value || typeof value !== "object") return false;
  const itinerary = value as Itinerary;
  return (
    typeof itinerary.title === "string" &&
    typeof itinerary.vibe === "string" &&
    typeof itinerary.vibeSummary === "string" &&
    Array.isArray(itinerary.itinerary)
  );
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const itineraryRaw = formData.get("itinerary");
  const visitedPlacesRaw = formData.get("visitedPlaces");
  const photoFiles = formData.getAll("photos").filter((entry): entry is File => entry instanceof File);

  let itinerary: Itinerary;
  let visitedPlaces: string[];
  try {
    itinerary = JSON.parse(String(itineraryRaw));
    visitedPlaces = JSON.parse(String(visitedPlacesRaw));
  } catch {
    return Response.json({ error: "itinerary and visitedPlaces must be valid JSON" }, { status: 400 });
  }

  if (!isValidItinerary(itinerary) || !Array.isArray(visitedPlaces) || !visitedPlaces.every((p) => typeof p === "string")) {
    return Response.json({ error: "Invalid itinerary or visitedPlaces payload" }, { status: 400 });
  }

  if (photoFiles.length > MAX_PHOTOS) {
    return Response.json({ error: `At most ${MAX_PHOTOS} photos are allowed` }, { status: 400 });
  }

  for (const file of photoFiles) {
    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return Response.json({ error: "Each photo must be under 8MB" }, { status: 400 });
    }
  }

  const photos: StoryPhoto[] = await Promise.all(
    photoFiles.map(async (file) => ({
      base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      mimeType: file.type,
    }))
  );

  try {
    const storyCard = await generateStoryCard({ itinerary, visitedPlaces, photos });
    return Response.json(storyCard);
  } catch (error) {
    console.error("Failed to generate story card", error);
    return Response.json({ error: "Failed to generate story card" }, { status: 502 });
  }
}
