// Standard: 1 word = 5 characters (including spaces)
const CHARS_PER_WORD = 5;

export function calculateWPM(charsTyped: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;

  const minutes = elapsedMs / 60000;
  const words = charsTyped / CHARS_PER_WORD;

  return Math.round(words / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100);
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correct: number;
  errors: number;
  totalTyped: number;
  elapsedMs: number;
}

export function computeStats(
  typed: string,
  target: string,
  startTime: number | null
): TypingStats {
  const now = Date.now();
  const elapsedMs = startTime ? now - startTime : 0;

  let correct = 0;
  let errors = 0;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) {
      correct++;
    } else {
      errors++;
    }
  }

  const totalTyped = typed.length;
  const wpm = calculateWPM(correct, elapsedMs);
  const accuracy = calculateAccuracy(correct, totalTyped);

  return {
    wpm,
    accuracy,
    correct,
    errors,
    totalTyped,
    elapsedMs,
  };
}
