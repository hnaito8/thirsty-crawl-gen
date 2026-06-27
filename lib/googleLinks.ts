import { Bar, Itinerary } from "@/lib/types";

// https://developers.google.com/maps/documentation/urls/get-started
export function buildMapsRouteUrl(itinerary: Itinerary, startLocation: string): string {
  const stops = itinerary.itinerary;
  if (stops.length === 0) return "";

  const lastStop = stops[stops.length - 1];
  const waypoints = stops.slice(0, -1).map((bar) => bar.address);

  const params = new URLSearchParams({
    api: "1",
    origin: startLocation,
    destination: lastStop.address,
    travelmode: "walking",
  });
  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

// Combines today's date with an "HH:MM" start time plus a stop's offset, without
// reading the current time/date — callers must supply `now` (e.g. computed once
// inside a click handler) so this stays a pure function safe to call during render.
export function computeEventStart(startTime: string, arrivalOffsetMin: number, now: Date): Date {
  const [hours, minutes] = startTime.split(":").map(Number);
  const start = new Date(now);
  start.setHours(hours, minutes, 0, 0);
  start.setMinutes(start.getMinutes() + arrivalOffsetMin);
  return start;
}

// https://support.google.com/calendar/answer/72143 (TEMPLATE render endpoint)
export function buildCalendarEventUrl(bar: Bar, eventStart: Date): string {
  const eventEnd = new Date(eventStart.getTime() + bar.durationMin * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${bar.barName} - Drink Stop`,
    dates: `${formatGoogleCalendarDate(eventStart)}/${formatGoogleCalendarDate(eventEnd)}`,
    details: `${bar.recommendedOrder.drinkName} — ${bar.recommendedOrder.vibeExplanation}\n\nQuest: ${bar.quest.task} (+${bar.quest.rewardPoints} pts)`,
    location: bar.address,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
