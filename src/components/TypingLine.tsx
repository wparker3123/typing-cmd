import React from "react";
import { Text, Box } from "ink";

interface TypingLineProps {
  target: string;
  typed: string;
}

export function TypingLine({ target, typed }: TypingLineProps) {
  const chars: React.ReactNode[] = [];

  for (let i = 0; i < target.length; i++) {
    const targetChar = target[i];
    const typedChar = typed[i];

    if (i < typed.length) {
      // Character has been typed
      if (typedChar === targetChar) {
        // Correct - green
        chars.push(
          <Text key={i} color="green">
            {targetChar}
          </Text>
        );
      } else {
        // Wrong - red background with the correct char shown
        chars.push(
          <Text key={i} backgroundColor="red" color="white">
            {targetChar}
          </Text>
        );
      }
    } else if (i === typed.length) {
      // Current cursor position - underlined
      chars.push(
        <Text key={i} underline color="white">
          {targetChar}
        </Text>
      );
    } else {
      // Not yet typed - dim
      chars.push(
        <Text key={i} dimColor>
          {targetChar}
        </Text>
      );
    }
  }

  return (
    <Box flexDirection="row" flexWrap="wrap">
      <Text>{chars}</Text>
    </Box>
  );
}
