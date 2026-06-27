"use client";

import React from "react";
import { Zap, Sunset, Beer, Flame } from "lucide-react";

export interface VibeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  activeGlow: string; // Tailwind glow/shadow color
  activeBorder: string; // Active border color
  activeBg: string; // Active gradient bg
  badgeColor: string;
}

export const vibes: VibeOption[] = [
  {
    id: "cyberpunk",
    name: "Neon Cyberpunk",
    description: "Futuristic neon lounges, electronic beats, and color-changing molecular drinks.",
    icon: Zap,
    activeGlow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    activeBorder: "border-rose-500",
    activeBg: "from-rose-500/10 to-indigo-500/5",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  {
    id: "speakeasy",
    name: "Cozy Speakeasy",
    description: "Behind secret doors. Candlelight, vintage jazz, and masterfully crafted classics.",
    icon: Flame,
    activeGlow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    activeBorder: "border-amber-500",
    activeBg: "from-amber-500/10 to-stone-500/5",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "rooftop",
    name: "Classy Rooftop",
    description: "Panoramas, fresh breezes, sparkling champagne, and chill lounge vibes.",
    icon: Sunset,
    activeGlow: "shadow-[0_0_20px_rgba(14,165,233,0.3)]",
    activeBorder: "border-sky-500",
    activeBg: "from-sky-500/10 to-blue-500/5",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  {
    id: "divebar",
    name: "Lively Dive Bar",
    description: "Cheap drinks, classic rock, arcade machines, and a rowdy, friendly crew.",
    icon: Beer,
    activeGlow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    activeBorder: "border-emerald-500",
    activeBg: "from-emerald-500/10 to-zinc-500/5",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
];

interface VibePickerProps {
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function VibePicker({ selectedValue, onChange }: VibePickerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 tracking-wide">
        Select Your Vibe
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vibes.map((vibe) => {
          const Icon = vibe.icon;
          const isActive = selectedValue === vibe.id;

          return (
            <button
              key={vibe.id}
              onClick={() => onChange(vibe.id)}
              className={`group text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? `bg-gradient-to-br ${vibe.activeBg} ${vibe.activeBorder} ${vibe.activeGlow} text-white`
                  : "bg-slate-900/40 hover:bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div
                  className={`p-3 rounded-xl border transition-colors ${
                    isActive
                      ? vibe.badgeColor
                      : "bg-slate-800/50 border-slate-700/50 group-hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                {isActive && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium uppercase tracking-wider ${vibe.badgeColor}`}
                  >
                    Active
                  </span>
                )}
              </div>
              <div>
                <h4 className={`font-bold text-base transition-colors ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                  {vibe.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {vibe.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
