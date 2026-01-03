import React from "react";
import { Text, Box, useInput } from "ink";
import type { Song } from "../types/index.js";

interface MenuProps {
  songs: Song[];
  selectedIndex: number;
  onSelect: (song: Song) => void;
  onNavigate: (delta: number) => void;
  onSearch: () => void;
}

export function Menu({ songs, selectedIndex, onSelect, onNavigate, onSearch }: MenuProps) {
  useInput((input, key) => {
    if (input === "s" || input === "S") {
      onSearch();
      return;
    }
    if (key.upArrow) {
      onNavigate(-1);
    } else if (key.downArrow) {
      onNavigate(1);
    } else if (key.return) {
      if (songs[selectedIndex]) {
        onSelect(songs[selectedIndex]);
      }
    }
  });

  if (songs.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">No local songs found.</Text>
        <Text dimColor>
          Add JSON files to the lyrics/ folder, or press [S] to search online.
        </Text>
        <Box marginTop={1}>
          <Text dimColor>[S] Search online | Ctrl+C to exit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Select a song (↑/↓ to navigate, Enter to select):
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {songs.map((song, index) => (
          <Box key={song.filename || index}>
            <Text
              color={index === selectedIndex ? "green" : undefined}
              bold={index === selectedIndex}
            >
              {index === selectedIndex ? "▸ " : "  "}
              {song.title}
              <Text dimColor> - {song.artist}</Text>
            </Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[S] Search online | Ctrl+C to exit</Text>
      </Box>
    </Box>
  );
}
