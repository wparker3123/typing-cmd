import React from "react";
import { Text, Box } from "ink";
import type { TypingStats } from "../lib/scoring.js";

interface StatsProps {
  stats: TypingStats;
  totalChars: number;
}

export function Stats({ stats, totalChars }: StatsProps) {
  const progress = Math.round((stats.totalTyped / totalChars) * 100);

  return (
    <Box flexDirection="row" gap={2} marginTop={1}>
      <Box>
        <Text>
          <Text color="cyan" bold>
            WPM:{" "}
          </Text>
          <Text>{stats.wpm}</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          <Text color="yellow" bold>
            Accuracy:{" "}
          </Text>
          <Text>{stats.accuracy}%</Text>
        </Text>
      </Box>
      <Box>
        <Text>
          <Text color="magenta" bold>
            Progress:{" "}
          </Text>
          <Text>
            {stats.totalTyped}/{totalChars} ({progress}%)
          </Text>
        </Text>
      </Box>
      {stats.errors > 0 && (
        <Box>
          <Text>
            <Text color="red" bold>
              Errors:{" "}
            </Text>
            <Text>{stats.errors}</Text>
          </Text>
        </Box>
      )}
    </Box>
  );
}
