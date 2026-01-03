import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import type { HighScore } from "../types/index.js";

const SCORES_FILE = join(homedir(), ".typecmd-scores.json");

export async function getHighScores(limit: number = 10): Promise<HighScore[]> {
  try {
    const content = await readFile(SCORES_FILE, "utf-8");
    const scores: HighScore[] = JSON.parse(content);

    // Sort by WPM descending, then by accuracy descending
    return scores
      .sort((a, b) => {
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
      })
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function saveScore(score: HighScore): Promise<void> {
  let scores: HighScore[] = [];

  try {
    const content = await readFile(SCORES_FILE, "utf-8");
    scores = JSON.parse(content);
  } catch {
    // File doesn't exist yet, start with empty array
  }

  scores.push(score);

  // Keep only top 100 scores
  scores = scores
    .sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    })
    .slice(0, 100);

  // Ensure directory exists
  const dir = dirname(SCORES_FILE);
  await mkdir(dir, { recursive: true }).catch(() => {});

  await writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
}

export function formatScore(score: HighScore): string {
  return `${score.wpm} WPM | ${score.accuracy}% | ${score.song} - ${score.artist}`;
}
