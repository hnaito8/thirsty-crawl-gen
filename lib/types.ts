export interface RecommendedOrder {
  drinkName: string;
  vibeExplanation: string;
}

export interface Quest {
  task: string;
  rewardPoints: number;
}

export interface Bar {
  barName: string;
  address: string;
  arrivalOffsetMin: number;
  durationMin: number;
  recommendedOrder: RecommendedOrder;
  quest: Quest;
}

export interface StoryFrame {
  frameNumber: number;
  headerText: string;
  caption: string;
  stickerIdea: string;
  bgGradient: string; // Tailwind class name or custom CSS gradient
}

export interface Itinerary {
  title: string;
  vibeSummary: string;
  totalDurationMin: number;
  budgetLevel: string;
  vibe: string;
  itinerary: Bar[];
  storyFrames: StoryFrame[];
}

export interface StoryCard {
  title: string;
  subtitle: string;
  caption: string;
  hashtags: string[];
}
