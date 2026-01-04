import type { Song, Snippet } from "../types/index.js";

interface LyricLine {
  text: string;
  wordCount: number;
}

function parseLines(lyrics: string): LyricLine[] {
  return lyrics
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      text: line,
      wordCount: line.split(/\s+/).length,
    }));
}

function findHookIndices(lines: LyricLine[]): number[] {
  const normalized = lines.map((l) => l.text.toLowerCase().trim());
  const counts = new Map<string, number>();

  for (const line of normalized) {
    counts.set(line, (counts.get(line) || 0) + 1);
  }

  return normalized
    .map((line, idx) => ((counts.get(line) || 0) >= 2 ? idx : -1))
    .filter((idx) => idx !== -1);
}

export function extractSnippet(
  song: Song,
  minWords: number = 25,
  maxWords: number = 55
): Snippet {
  const lines = parseLines(song.lyrics);

  if (lines.length === 0) {
    return {
      text: "",
      wordCount: 0,
      sourceTitle: song.title,
      sourceArtist: song.artist,
    };
  }

  // Calculate total words
  const totalWords = lines.reduce((sum, line) => sum + line.wordCount, 0);

  // If the song is short, use all of it
  if (totalWords <= maxWords) {
    return {
      text: lines.map((l) => l.text).join(" "),
      wordCount: totalWords,
      sourceTitle: song.title,
      sourceArtist: song.artist,
    };
  }

  // Find hook indices and decide whether to prefer hooks
  const hookIndices = findHookIndices(lines);
  const preferHook = hookIndices.length > 0 && Math.random() < 0.5;

  // Select starting line
  let startLineIdx: number;
  if (preferHook) {
    startLineIdx = hookIndices[Math.floor(Math.random() * hookIndices.length)];
  } else {
    startLineIdx = Math.floor(Math.random() * lines.length);
  }

  // Collect consecutive lines until we hit word target
  const selectedLines: LyricLine[] = [];
  let wordCount = 0;
  let lineIdx = startLineIdx;

  while (wordCount < minWords && lineIdx < lines.length) {
    selectedLines.push(lines[lineIdx]);
    wordCount += lines[lineIdx].wordCount;
    lineIdx++;
  }

  // If we're still under min words and started mid-song, wrap to beginning
  if (wordCount < minWords && startLineIdx > 0) {
    lineIdx = 0;
    while (wordCount < minWords && lineIdx < startLineIdx) {
      selectedLines.push(lines[lineIdx]);
      wordCount += lines[lineIdx].wordCount;
      lineIdx++;
    }
  }

  // Handle edge case: single very long line exceeds maxWords
  let text = selectedLines.map((l) => l.text).join(" ");
  if (wordCount > maxWords) {
    const words = text.split(/\s+/);
    text = words.slice(0, maxWords).join(" ");
    wordCount = maxWords;
  }

  return {
    text,
    wordCount,
    sourceTitle: song.title,
    sourceArtist: song.artist,
  };
}
