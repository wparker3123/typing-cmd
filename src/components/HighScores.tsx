import React from "react";
import { Text, Box } from "ink";
import type { HighScore } from "../types/index.js";

interface HighScoresProps {
  scores: HighScore[];
}

export function HighScores({ scores }: HighScoresProps) {
  if (scores.length === 0) {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold color="yellow">
          High Scores
        </Text>
        <Text dimColor>No scores yet. Play a game!</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="yellow">
        Top Scores
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {scores.slice(0, 5).map((score, index) => (
          <Box key={index} gap={1}>
            <Text color="cyan">{index + 1}.</Text>
            <Text bold>{score.wpm} WPM</Text>
            <Text dimColor>|</Text>
            <Text>{score.accuracy}%</Text>
            <Text dimColor>|</Text>
            <Text dimColor>
              {score.song} - {score.artist}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
