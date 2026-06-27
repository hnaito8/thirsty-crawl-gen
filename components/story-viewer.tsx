"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { StoryFrame } from "@/lib/types";
import { ChevronLeft, ChevronRight, Play, Pause, Share2 } from "lucide-react";

interface StoryViewerProps {
  frames: StoryFrame[];
}

export default function StoryViewer({ frames }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? frames.length - 1 : prev - 1));
  }, [frames.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === frames.length - 1 ? 0 : prev + 1));
  }, [frames.length]);

  // Reset progress when the slide changes — computed during render rather than
  // in an effect, since this is purely derived from the currentIndex change itself.
  const [progressResetForIndex, setProgressResetForIndex] = useState(currentIndex);
  if (currentIndex !== progressResetForIndex) {
    setProgressResetForIndex(currentIndex);
    setProgress(0);
  }

  // Timer loop for auto-play progress
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 2; // Increment progress (approx 100ms interval for 2% matches 5s total)
        });
      }, 100);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentIndex, handleNext]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareStatus("Copying link to clipboard...");
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => {
      setShareStatus("Link copied!");
      setTimeout(() => setShareStatus(null), 2000);
    }, 800);
  };

  const currentFrame = frames[currentIndex];

  if (!currentFrame) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Play/Pause control info */}
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <span>Tap left/right side of the card to navigate</span>
        <span>•</span>
        <button
          onClick={togglePlay}
          className="hover:text-slate-300 flex items-center gap-1 cursor-pointer font-semibold uppercase tracking-wider"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isPlaying ? "Pause Autoplay" : "Resume Autoplay"}
        </button>
      </div>

      {/* Story Phone Mock Frame */}
      <div
        className={`w-full max-w-[360px] aspect-[9/16] rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800 bg-gradient-to-br ${currentFrame.bgGradient} flex flex-col justify-between p-6 select-none cursor-pointer`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX < rect.width / 2) {
            handlePrev();
          } else {
            handleNext();
          }
        }}
      >
        {/* Instagram Progress Bars */}
        <div className="flex gap-1.5 w-full z-20">
          {frames.map((_, index) => {
            let width = "0%";
            if (index < currentIndex) width = "100%";
            else if (index === currentIndex) width = `${progress}%`;

            return (
              <div key={index} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Card Info */}
        <div className="flex items-center justify-between z-20 mt-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
              🍷
            </div>
            <div>
              <span className="text-xs font-extrabold text-white block leading-none">I&apos;m Feeling Thirsty</span>
              <span className="text-[10px] text-white/60">Story Frame {currentIndex + 1} of {frames.length}</span>
            </div>
          </div>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Floating Huge Sticker Emoji */}
        <div className="flex items-center justify-center flex-1 py-10 z-15 relative">
          <div className="text-8xl filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] animate-bounce duration-1000 select-none">
            {currentFrame.stickerIdea}
          </div>
          {/* Subtle decorative circles */}
          <div className="absolute w-48 h-48 rounded-full border border-white/5 bg-white/5 backdrop-blur-3xl -z-10 animate-pulse" />
        </div>

        {/* Story Text Information Footer */}
        <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-5 z-20 space-y-2.5 relative">
          <h4 className="text-lg font-black text-white tracking-tight uppercase leading-snug">
            {currentFrame.headerText}
          </h4>
          <p className="text-xs text-white/90 leading-relaxed font-medium">
            {currentFrame.caption}
          </p>
        </div>

        {/* Absolute navigation guides (very subtle) */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 text-white/30 hover:text-white pointer-events-none transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 text-white/30 hover:text-white pointer-events-none transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* Share / Action Buttons */}
      <div className="w-full max-w-[360px] flex flex-col items-center">
        <button
          onClick={handleShare}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-violet-500/20 hover:border-violet-400/40 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Share Thirst Story
        </button>

        {shareStatus && (
          <div className="mt-3 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg animate-pulse">
            {shareStatus}
          </div>
        )}
      </div>
    </div>
  );
}
