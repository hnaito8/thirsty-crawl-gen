import { generateItinerary, PlannerInput } from "@/lib/planner";

function isValidInput(body: unknown): body is PlannerInput {
  if (!body || typeof body !== "object") return false;
  const { location, time, budget, mood } = body as Record<string, unknown>;
  return (
    typeof location === "string" &&
    location.trim().length > 0 &&
    typeof time === "string" &&
    time.trim().length > 0 &&
    typeof budget === "string" &&
    budget.trim().length > 0 &&
    typeof mood === "string" &&
    mood.trim().length > 0
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidInput(body)) {
    return Response.json(
      { error: "location, time, budget, and mood are required strings" },
      { status: 400 }
    );
  }

  try {
    const itinerary = await generateItinerary(body);
    return Response.json(itinerary);
  } catch (error) {
    console.error("Failed to generate itinerary", error);
    return Response.json({ error: "Failed to generate itinerary" }, { status: 502 });
  }
}
