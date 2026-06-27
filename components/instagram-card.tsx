"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { StoryCard } from "@/lib/types";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

const VIBE_THEMES: Record<string, { gradient: string; accent: string; tint: string }> = {
  "neon cyberpunk": {
    gradient: "from-rose-900 via-fuchsia-950 to-indigo-950",
    accent: "text-rose-300",
    tint: "bg-rose-500/20",
  },
  "cozy speakeasy": {
    gradient: "from-amber-900 via-stone-950 to-stone-900",
    accent: "text-amber-300",
    tint: "bg-amber-500/20",
  },
  "classy rooftop": {
    gradient: "from-sky-900 via-indigo-950 to-slate-950",
    accent: "text-sky-300",
    tint: "bg-sky-500/20",
  },
  "lively dive bar": {
    gradient: "from-red-900 via-stone-950 to-zinc-950",
    accent: "text-emerald-300",
    tint: "bg-emerald-500/20",
  },
};

function getVibeTheme(vibe: string) {
  return (
    VIBE_THEMES[vibe.toLowerCase()] ?? {
      gradient: "from-slate-900 via-slate-950 to-black",
      accent: "text-amber-300",
      tint: "bg-amber-500/20",
    }
  );
}

function photoGridClass(count: number): string {
  if (count <= 1) return "absolute inset-0 grid grid-cols-1";
  if (count === 2) return "absolute inset-0 grid grid-cols-2 gap-[3px]";
  return "absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[3px]";
}

function photoItemClass(count: number, index: number): string {
  if (count === 3 && index === 0) return "row-span-2";
  return "";
}

export interface InstagramCardHandle {
  toPngDataUrl: () => Promise<string | null>;
}

interface InstagramCardProps {
  storyCard: StoryCard;
  vibe: string;
  photoUrls: string[];
}

const InstagramCard = forwardRef<InstagramCardHandle, InstagramCardProps>(function InstagramCard(
  { storyCard, vibe, photoUrls },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? CARD_WIDTH;
      setScale(Math.min(1, width / CARD_WIDTH));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    toPngDataUrl: async () => {
      if (!cardRef.current) return null;
      return toPng(cardRef.current, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        pixelRatio: 1,
      });
    },
  }));

  const theme = getVibeTheme(vibe);
  const photos = photoUrls.slice(0, 4);

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ width: CARD_WIDTH * scale, height: CARD_HEIGHT * scale }}>
        {/* Scale wrapper only — kept separate from the exported node below so PNG export always
            captures the true 1080x1350 render, regardless of the on-screen preview scale. */}
        <div style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div
            ref={cardRef}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
            className={`relative overflow-hidden rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] bg-gradient-to-br ${theme.gradient}`}
          >
            {/* Photo collage */}
            {photos.length > 0 && (
              <div className={photoGridClass(photos.length)}>
                {photos.map((url, i) => (
                  <div key={url} className={`relative ${photoItemClass(photos.length, i)}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded blob URL, not a static asset */}
                    <img src={url} alt={`Crawl photo ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute inset-0 ${theme.tint} mix-blend-multiply`} />
                  </div>
                ))}
              </div>
            )}

            {/* Depth vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)]" />

            {/* Bottom legibility gradient */}
            <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/75 to-transparent" />

            {/* Premium inset frame */}
            <div className="absolute inset-4 rounded-[20px] border border-white/15 pointer-events-none" />

            {/* Brand badge */}
            <div className="absolute top-10 left-10 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/20">
                🍷
              </div>
              <div>
                <span className="text-white font-extrabold text-[22px] block leading-none drop-shadow-sm">
                  I&apos;m Feeling Thirsty
                </span>
                <span className="text-white/70 text-[13px] uppercase tracking-[0.25em] font-bold">Night Recap</span>
              </div>
            </div>

            {/* Top-right vibe seal */}
            <div className="absolute top-10 right-10 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
              <span className={`text-[14px] font-bold uppercase tracking-[0.15em] ${theme.accent}`}>{vibe}</span>
            </div>

            {/* Text content panel */}
            <div className="absolute inset-x-0 bottom-0 p-12 pt-0">
              <div className="rounded-[24px] bg-black/35 backdrop-blur-xl border border-white/10 p-8 space-y-5 shadow-2xl">
                <h1 className="text-white font-black text-[64px] leading-[1.02] tracking-tight drop-shadow-sm">
                  {storyCard.title}
                </h1>
                <p className={`text-[26px] font-semibold leading-snug ${theme.accent}`}>{storyCard.subtitle}</p>
                <div className="h-px bg-white/15" />
                <p className="text-white/90 text-[23px] leading-relaxed line-clamp-3">{storyCard.caption}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {storyCard.hashtags.slice(0, 8).map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[18px] font-semibold text-amber-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-center text-white/40 text-[14px] font-medium tracking-wide mt-4">
                Generated with Gemini · I&apos;m Feeling Thirsty
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InstagramCard;
