export interface Song {
  title: string;
  artist: string;
  lyrics: string;
  filename?: string;
}

export interface Snippet {
  text: string;
  wordCount: number;
  sourceTitle: string;
  sourceArtist: string;
}

export interface GameState {
  snippet: Snippet;
  typed: string;
  startTime: number | null;
  errors: number;
  currentIndex: number;
}

export interface HighScore {
  song: string;
  artist: string;
  wpm: number;
  accuracy: number;
  date: string;
}

export type GameScreen = "menu" | "search" | "playing" | "results";
