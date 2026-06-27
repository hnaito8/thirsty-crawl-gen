"use client";

import React, { useState } from "react";
import VibePicker, { vibes } from "@/components/vibe-picker";
import ItineraryDisplay from "@/components/itinerary-display";
import StoryViewer from "@/components/story-viewer";
import StoryCardGenerator from "@/components/story-card-generator";
import { Itinerary } from "@/lib/types";
import { Sparkles, MapPin, DollarSign, Clock, List, MessageSquare, ImagePlus } from "lucide-react";

const budgetLevels = [
  { value: "1", label: "$", description: "Cheap Drafts & Bites" },
  { value: "2", label: "$$", description: "Curated Craft Lounges" },
  { value: "3", label: "$$$", description: "VIP Rooftops & Speakeasies" },
  { value: "4", label: "$$$$", description: "Exclusive Luxury Spots" },
];

export default function Home() {
  // Input parameters state
  const [selectedVibe, setSelectedVibe] = useState("cyberpunk");
  const [budgetIndex, setBudgetIndex] = useState("2"); // defaults to $$
  const [startLocation, setStartLocation] = useState("Shibuya, Tokyo");
  const [startTime, setStartTime] = useState("20:00");

  // App UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [activeTab, setActiveTab] = useState<"itinerary" | "stories" | "recap">("itinerary");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const budgetLabel = budgetLevels[parseInt(budgetIndex) - 1].label;
      const mood = vibes.find((v) => v.id === selectedVibe)?.name ?? selectedVibe;

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: startLocation, time: startTime, budget: budgetLabel, mood }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const itinerary: Itinerary = await res.json();
      setGeneratedItinerary(itinerary);
      setActiveTab("itinerary");
    } catch {
      setError("Couldn't generate your crawl trail. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedItinerary(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-black text-lg text-slate-950 shadow-lg shadow-amber-500/10">
              🍷
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block text-slate-100">
                Thirsty
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold -mt-1 block">
                Crawl Gen
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-300 font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
              <Sparkles className="w-3 h-3" />
              Gemini Hackathon
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        {!generatedItinerary ? (
          // Input Form View
          <div className="space-y-10 max-w-2xl mx-auto w-full animate-fade-in">
            {/* Title Hero */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500">
                I&apos;m Feeling Thirsty
              </h1>
              <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
                Generate a custom nightlife cocktail trail with unique challenges and story frames for your crew.
              </p>
            </div>

            {/* Glass Form Panel */}
            <form
              onSubmit={handleGenerate}
              className="p-6 md:p-8 rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl space-y-8 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle background glow decorator */}
              <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-amber-500/5 filter blur-3xl -z-10" />
              <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-rose-500/5 filter blur-3xl -z-10" />

              {/* Start Location Input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  Starting Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="E.g. Shibuya, Shinjuku, Roppongi"
                    className="w-full px-5 py-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-2xl text-slate-200 placeholder-slate-600 transition-all text-sm outline-none font-medium"
                  />
                </div>
              </div>

              {/* Start Time Input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Start Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-2xl text-slate-200 placeholder-slate-600 transition-all text-sm outline-none font-medium"
                  />
                </div>
              </div>

              {/* Vibe Picker Grid */}
              <VibePicker selectedValue={selectedVibe} onChange={setSelectedVibe} />

              {/* Budget Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Budget Level
                  </label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {budgetLevels[parseInt(budgetIndex) - 1].description}
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={budgetIndex}
                    onChange={(e) => setBudgetIndex(e.target.value)}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between px-1 text-xs text-slate-500 font-bold">
                    {budgetLevels.map((b) => (
                      <span
                        key={b.value}
                        className={`transition-colors cursor-pointer ${
                          budgetIndex === b.value ? "text-emerald-400 scale-110" : ""
                        }`}
                        onClick={() => setBudgetIndex(b.value)}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-center font-medium">
                  {error}
                </p>
              )}

              {/* Generate Trigger Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 hover:from-amber-300 hover:via-rose-400 hover:to-indigo-400 shadow-xl shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Stirring up your trail...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    Generate My Crawl Trail
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          // Output Display View
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto w-full">
            {/* View Switcher Tabs */}
            <div className="flex border-b border-slate-900">
              <button
                onClick={() => setActiveTab("itinerary")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                  activeTab === "itinerary"
                    ? "border-amber-500 text-slate-100"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <List className="w-4 h-4" />
                Interactive Itinerary
              </button>
              <button
                onClick={() => setActiveTab("stories")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                  activeTab === "stories"
                    ? "border-rose-500 text-slate-100"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Insta-Story Viewer
              </button>
              <button
                onClick={() => setActiveTab("recap")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                  activeTab === "recap"
                    ? "border-indigo-500 text-slate-100"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <ImagePlus className="w-4 h-4" />
                Recap Card
              </button>
            </div>

            {/* Conditional Tab Rendering */}
            <div className="py-4">
              {activeTab === "itinerary" && (
                <ItineraryDisplay
                  itinerary={generatedItinerary}
                  onReset={handleReset}
                  startLocation={startLocation}
                  startTime={startTime}
                />
              )}
              {activeTab === "stories" && <StoryViewer frames={generatedItinerary.storyFrames} />}
              {activeTab === "recap" && <StoryCardGenerator itinerary={generatedItinerary} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
