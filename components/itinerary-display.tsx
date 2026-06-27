"use client";

import React, { useState } from "react";
import { Bar, Itinerary } from "@/lib/types";
import { buildCalendarEventUrl, buildMapsRouteUrl, computeEventStart } from "@/lib/googleLinks";
import { MapPin, Clock, Award, CheckCircle, RefreshCw, GlassWater, Trophy, Route, CalendarPlus } from "lucide-react";

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onReset: () => void;
  startLocation: string;
  startTime: string;
}

export default function ItineraryDisplay({ itinerary, onReset, startLocation, startTime }: ItineraryDisplayProps) {
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [totalPoints, setTotalPoints] = useState(0);

  const toggleQuest = (barName: string, points: number) => {
    const isCurrentlyCompleted = !!completedQuests[barName];
    setCompletedQuests((prev) => ({
      ...prev,
      [barName]: !isCurrentlyCompleted,
    }));
    setTotalPoints((prev) =>
      isCurrentlyCompleted ? prev - points : prev + points
    );
  };

  const handleOpenMapsRoute = () => {
    window.open(buildMapsRouteUrl(itinerary, startLocation), "_blank", "noopener,noreferrer");
  };

  const handleAddToCalendar = (bar: Bar) => {
    const eventStart = computeEventStart(startTime, bar.arrivalOffsetMin, new Date());
    window.open(buildCalendarEventUrl(bar, eventStart), "_blank", "noopener,noreferrer");
  };

  const getVibeTheme = () => {
    switch (itinerary.vibe.toLowerCase()) {
      case "neon cyberpunk":
        return {
          accent: "text-rose-400 border-rose-500/30 bg-rose-500/10",
          glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
          bullet: "bg-rose-500 ring-rose-500/30",
          border: "border-rose-500/20",
        };
      case "cozy speakeasy":
        return {
          accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
          bullet: "bg-amber-500 ring-amber-500/30",
          border: "border-amber-500/20",
        };
      case "classy rooftop":
        return {
          accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
          glow: "shadow-[0_0_15px_rgba(14,165,233,0.15)]",
          bullet: "bg-sky-500 ring-sky-500/30",
          border: "border-sky-500/20",
        };
      default:
        return {
          accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
          glow: "shadow-[0_0_15px_rgba(34,197,94,0.15)]",
          bullet: "bg-emerald-500 ring-emerald-500/30",
          border: "border-emerald-500/20",
        };
    }
  };

  const theme = getVibeTheme();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Info */}
      <div className={`p-6 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden ${theme.glow}`}>
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Trophy className="w-24 h-24 text-white" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold tracking-wider uppercase ${theme.accent}`}>
                {itinerary.vibe}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-800 bg-slate-800/30 text-slate-400 font-semibold uppercase tracking-wider">
                Budget: {itinerary.budgetLevel}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
              {itinerary.title}
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {itinerary.vibeSummary}
            </p>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t border-slate-800/60 md:border-t-0 pt-4 md:pt-0 gap-4">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-500 block uppercase font-medium tracking-wider">Quest Score</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-black text-yellow-400">{totalPoints} <span className="text-sm font-normal text-slate-400">pts</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenMapsRoute}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${theme.accent}`}
              >
                <Route className="w-3.5 h-3.5" />
                Open Route in Maps
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Crawl
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Crawl Timeline */}
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 md:left-8 top-8 bottom-8 w-[2px] bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800" />

        <div className="space-y-8">
          {itinerary.itinerary.map((bar) => {
            const isCompleted = !!completedQuests[bar.barName];
            return (
              <div key={bar.barName} className="flex gap-4 md:gap-8 relative group">
                {/* Timeline Bullet */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">
                      +{bar.arrivalOffsetMin}m
                    </span>
                  </div>
                </div>

                {/* Bar Details Card */}
                <div className={`flex-1 p-6 rounded-2xl border bg-slate-900/40 backdrop-blur-md transition-all duration-300 ${
                  isCompleted ? "border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] bg-emerald-500/5" : "border-slate-800/80 hover:border-slate-700"
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        {bar.barName}
                        {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {bar.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      <div className="text-xs text-slate-500 bg-slate-800/40 border border-slate-800/80 rounded-lg px-2.5 py-1 font-medium">
                        Duration: {bar.durationMin} mins
                      </div>
                      <button
                        onClick={() => handleAddToCalendar(bar)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        Add to Calendar
                      </button>
                    </div>
                  </div>

                  {/* Drink Recommendation */}
                  <div className="mt-5 p-4 rounded-xl bg-slate-950/50 border border-slate-900/80 flex gap-3.5">
                    <div className={`p-2.5 rounded-lg border h-fit shrink-0 ${theme.accent}`}>
                      <GlassWater className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Recommended Order</span>
                      <h4 className="font-bold text-slate-200 text-sm mt-0.5">{bar.recommendedOrder.drinkName}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{bar.recommendedOrder.vibeExplanation}</p>
                    </div>
                  </div>

                  {/* Quest */}
                  <div className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
                    isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-950/20 border-slate-800/50"
                  }`}>
                    <div className="flex gap-3">
                      <div className={`p-2.5 rounded-lg border h-fit shrink-0 ${isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/50 border-slate-700/50 text-yellow-400"}`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Bar Quest</span>
                        <p className="text-xs font-medium text-slate-300 mt-0.5 leading-relaxed">{bar.quest.task}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleQuest(bar.barName, bar.quest.rewardPoints)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wide border transition-all cursor-pointer select-none text-center ${
                        isCompleted
                          ? "bg-emerald-500 text-slate-950 border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:bg-emerald-400"
                          : "bg-slate-800/60 text-slate-200 border-slate-700/60 hover:bg-slate-700 hover:border-slate-600 hover:text-white"
                      }`}
                    >
                      {isCompleted ? "COMPLETED!" : `CLAIM +${bar.quest.rewardPoints} PTS`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
