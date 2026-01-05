import React, { useState, useEffect } from "react";
import { Text, Box, useInput, useApp } from "ink";
import type { Song, Snippet, GameScreen, HighScore } from "../types";
import { loadAllSongs } from "../lib/lyrics.js";
import { extractSnippet } from "../lib/snippet.js";
import { computeStats, type TypingStats } from "../lib/scoring.js";
import { saveScore, getHighScores } from "../lib/highscores.js";
import { Menu } from "./Menu.js";
import { Search } from "./Search.js";
import { TypingLine } from "./TypingLine.js";
import { Stats } from "./Stats.js";
import { HighScores } from "./HighScores.js";

export function Game() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);

  // Load songs on mount
  useEffect(() => {
    async function load() {
      const loadedSongs = await loadAllSongs().then(songs => {
          return songs.sort((a, b) => {
              return a.title?.toLowerCase().localeCompare(b.title?.toLowerCase()); // alphabetical order
          });
      })
      setSongs(loadedSongs);
      const scores = await getHighScores(5);
      setHighScores(scores);
      setLoading(false);
    }
    load();
  }, []);

  // Handle keyboard input during game
  useInput(
    (input, key) => {
      if (screen !== "playing" || !snippet) return;

      if (key.backspace || key.delete) {
        setTyped((prev) => prev.slice(0, -1));
        return;
      }

      if (key.escape) {
        // Return to menu
        setScreen("menu");
        setTyped("");
        setStartTime(null);
        return;
      }

      // Ignore control keys
      if (key.ctrl || key.meta || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) {
        return;
      }

      // Block new input if there's an uncorrected error at the last position
      // User must backspace to fix the error before continuing
      if (typed.length > 0 && typed[typed.length - 1] !== snippet.text[typed.length - 1]) {
        // There's an error at the current position - block new input
        return;
      }

      // Start timer on first keypress
      if (startTime === null && input.length > 0) {
        setStartTime(Date.now());
      }

      // Add typed character
      if (input.length > 0) {
        const newTyped = typed + input;
        setTyped(newTyped);

        // Check if game is complete
        if (newTyped.length >= snippet.text.length) {
          finishGame(newTyped, snippet);
        }
      }
    },
    { isActive: screen === "playing" }
  );

  // Handle results screen input
  useInput(
    (input, key) => {
      if (screen !== "results") return;

      if (input === "r" || input === "R") {
        // Play again with same song
        if (currentSong) {
          startGame(currentSong);
        }
      } else if (input === "m" || input === "M" || key.escape) {
        // Return to menu
        setScreen("menu");
        setFinalStats(null);
      } else if (input === "q" || input === "Q") {
        exit();
      }
    },
    { isActive: screen === "results" }
  );

  async function finishGame(finalTyped: string, currentSnippet: Snippet) {
    const stats = computeStats(finalTyped, currentSnippet.text, startTime);
    setFinalStats(stats);
    setScreen("results");

    // Save high score
    const score: HighScore = {
      song: currentSnippet.sourceTitle,
      artist: currentSnippet.sourceArtist,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      date: new Date().toISOString(),
    };
    await saveScore(score);

    // Refresh high scores
    const scores = await getHighScores(5);
    setHighScores(scores);
  }

  function startGame(song: Song) {
    const newSnippet = extractSnippet(song);
    setSnippet(newSnippet);
    setCurrentSong(song);
    setTyped("");
    setStartTime(null);
    setFinalStats(null);
    setScreen("playing");
  }

  function handleNavigate(delta: number) {
    setSelectedIndex((prev) => {
      const newIndex = prev + delta;
      if (newIndex < 0) return songs.length - 1;
      if (newIndex >= songs.length) return 0;
      return newIndex;
    });
  }

  if (loading) {
    return (
      <Box padding={1}>
        <Text>Loading songs...</Text>
      </Box>
    );
  }

  if (screen === "menu") {
    return (
      <Box flexDirection="column">
        <Box padding={1}>
          <Text bold color="magenta">
            ♪ TypeCMD - Lyrics Typing Game ♪
          </Text>
        </Box>
        <Menu
          songs={songs}
          selectedIndex={selectedIndex}
          onSelect={startGame}
          onNavigate={handleNavigate}
          onSearch={() => setScreen("search")}
        />
        {highScores.length > 0 && <HighScores scores={highScores} />}
      </Box>
    );
  }

  if (screen === "search") {
    return (
      <Box flexDirection="column">
        <Box padding={1}>
          <Text bold color="magenta">
            ♪ TypeCMD - Lyrics Typing Game ♪
          </Text>
        </Box>
        <Search
          onSelect={(song) => startGame(song)}
          onBack={() => setScreen("menu")}
          onSaved={async () => {
            const refreshedSongs = await loadAllSongs();
            setSongs(refreshedSongs);
          }}
        />
      </Box>
    );
  }

  if (screen === "playing" && snippet) {
    const stats = computeStats(typed, snippet.text, startTime);

    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {snippet.sourceTitle}
          </Text>
          <Text dimColor> - {snippet.sourceArtist}</Text>
          <Text dimColor> ({snippet.wordCount} words)</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Type the lyrics below. Press Esc to quit.</Text>
        </Box>
        <TypingLine target={snippet.text} typed={typed} />
        <Stats stats={stats} totalChars={snippet.text.length} />
      </Box>
    );
  }

  if (screen === "results" && finalStats && snippet) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="green">
          Complete!
        </Text>
        <Box marginTop={1} flexDirection="column">
          <Text>
            <Text bold color="cyan">Song: </Text>
            {snippet.sourceTitle} - {snippet.sourceArtist}
          </Text>
          <Text>
            <Text bold color="yellow">WPM: </Text>
            {finalStats.wpm}
          </Text>
          <Text>
            <Text bold color="magenta">Accuracy: </Text>
            {finalStats.accuracy}%
          </Text>
          <Text>
            <Text bold>Characters: </Text>
            {finalStats.correct} correct, {finalStats.errors} errors
          </Text>
        </Box>
        <HighScores scores={highScores} />
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>[R] Play again | [M] Menu | [Q] Quit</Text>
        </Box>
      </Box>
    );
  }

  return null;
}
