"use client";

import React, { useRef, useState } from "react";
import { Itinerary, StoryCard } from "@/lib/types";
import { resizeImageFile } from "@/lib/clientImage";
import InstagramCard, { InstagramCardHandle } from "@/components/instagram-card";
import { ImagePlus, X, Sparkles, RefreshCw, Download, Share2, Undo2 } from "lucide-react";

interface UploadedPhoto {
  file: File;
  previewUrl: string;
}

interface StoryCardGeneratorProps {
  itinerary: Itinerary;
}

export default function StoryCardGenerator({ itinerary }: StoryCardGeneratorProps) {
  const [visitedPlaces, setVisitedPlaces] = useState<Record<string, boolean>>(
    () => Object.fromEntries(itinerary.itinerary.map((bar) => [bar.barName, true]))
  );
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyCard, setStoryCard] = useState<StoryCard | null>(null);
  const cardHandleRef = useRef<InstagramCardHandle>(null);

  const toggleVisited = (barName: string) => {
    setVisitedPlaces((prev) => ({ ...prev, [barName]: !prev[barName] }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const newPhotos = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (previewUrl: string) => {
    setPhotos((prev) => prev.filter((p) => p.previewUrl !== previewUrl));
    URL.revokeObjectURL(previewUrl);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const resizedFiles = await Promise.all(photos.map((p) => resizeImageFile(p.file)));

      const formData = new FormData();
      formData.set("itinerary", JSON.stringify(itinerary));
      formData.set(
        "visitedPlaces",
        JSON.stringify(itinerary.itinerary.map((bar) => bar.barName).filter((name) => visitedPlaces[name]))
      );
      resizedFiles.forEach((file) => formData.append("photos", file));

      const res = await fetch("/api/story-card", { method: "POST", body: formData });
      if (!res.ok) {
        throw new Error("Failed to generate story card");
      }

      setStoryCard(await res.json());
    } catch {
      setError("Couldn't generate your recap card. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await cardHandleRef.current?.toPngDataUrl();
    if (!dataUrl) {
      setError("Couldn't export the card. Please try again.");
      return;
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "thirsty-night-recap.png";
    link.click();
  };

  const handleShare = async () => {
    const dataUrl = await cardHandleRef.current?.toPngDataUrl();
    if (!dataUrl || !storyCard) {
      setError("Couldn't share the card. Please try again.");
      return;
    }

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "thirsty-night-recap.png", { type: "image/png" });
      const shareText = `${storyCard.caption}\n\n${storyCard.hashtags.join(" ")}`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: storyCard.title, text: shareText });
      } else if (navigator.share) {
        await navigator.share({ title: storyCard.title, text: shareText });
      } else {
        handleDownload();
      }
    } catch {
      // User cancelled the share sheet or the browser blocked it — not a real error.
    }
  };

  if (storyCard) {
    return (
      <div className="space-y-6 animate-fade-in max-w-xl mx-auto w-full">
        <div className={`transition-opacity ${isGenerating ? "opacity-40 pointer-events-none" : ""}`}>
          <InstagramCard
            ref={cardHandleRef}
            storyCard={storyCard}
            vibe={itinerary.vibe}
            photoUrls={photos.map((p) => p.previewUrl)}
          />
        </div>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-center font-medium">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-950 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Regenerating..." : "Regenerate Story"}
          </button>
          <button
            onClick={() => setStoryCard(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Make Another Recap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto w-full animate-fade-in">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 tracking-wide">Which stops did you actually hit?</h3>
        <div className="space-y-2">
          {itinerary.itinerary.map((bar) => (
            <label
              key={bar.barName}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={!!visitedPlaces[bar.barName]}
                onChange={() => toggleVisited(bar.barName)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-200">{bar.barName}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 tracking-wide">Upload your photos</h3>
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.previewUrl} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-800 group">
              {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded blob preview */}
              <img src={photo.previewUrl} alt="Uploaded photo preview" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(photo.previewUrl)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 flex items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-amber-400">
            <ImagePlus className="w-6 h-6" />
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-center font-medium">
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 hover:from-amber-300 hover:via-rose-400 hover:to-indigo-400 shadow-xl shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Writing your recap...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 fill-current" />
            Generate Recap Card
          </>
        )}
      </button>
    </div>
  );
}
