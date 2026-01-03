import React, { useState, useEffect } from "react";
import { Text, Box, useInput } from "ink";
import type { Song } from "../types/index.js";
import { searchSongs, getLyricsById, type SearchResult } from "../lib/scraper.js";
import { saveSong, songExists, getSongCount, MAX_SONGS } from "../lib/lyrics.js";

interface SearchProps {
  onSelect: (song: Song) => void;
  onBack: () => void;
  onSaved: () => void; // Called when a song is saved to refresh the menu
}

type SearchState = "input" | "searching" | "results" | "fetching" | "confirm";

interface ConfirmOption {
  key: string;
  label: string;
  action: "play" | "save" | "saveAndPlay";
}

const CONFIRM_OPTIONS: ConfirmOption[] = [
  { key: "1", label: "Play now", action: "play" },
  { key: "2", label: "Save & Play", action: "saveAndPlay" },
  { key: "3", label: "Save for later", action: "save" },
];

export function Search({ onSelect, onBack, onSaved }: SearchProps) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("input");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fetchedSong, setFetchedSong] = useState<Song | null>(null);
  const [songCount, setSongCount] = useState(0);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getSongCount().then(setSongCount);
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (state === "confirm") {
        setState("results");
        setFetchedSong(null);
        setMessage(null);
      } else if (state === "results") {
        setState("input");
        setResults([]);
        setSelectedIndex(0);
      } else {
        onBack();
      }
      return;
    }

    if (state === "input") {
      if (key.return) {
        if (query.trim().length > 0) {
          performSearch();
        }
        return;
      }

      if (key.backspace || key.delete) {
        setQuery((prev) => prev.slice(0, -1));
        return;
      }

      if (key.ctrl || key.meta || key.upArrow || key.downArrow) {
        return;
      }

      if (input.length > 0) {
        setQuery((prev) => prev + input);
      }
    }

    if (state === "results") {
      if (key.upArrow) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (key.return && results[selectedIndex]) {
        fetchAndConfirm(results[selectedIndex]);
      }
    }

    if (state === "confirm" && fetchedSong) {
      const option = CONFIRM_OPTIONS.find((o) => o.key === input);
      if (option) {
        handleConfirmAction(option.action);
      }
    }
  });

  async function performSearch() {
    setState("searching");
    setError(null);

    try {
      const searchResults = await searchSongs(query);
      if (searchResults.length === 0) {
        setError("No songs found. Try a different search.");
        setState("input");
      } else {
        setResults(searchResults.slice(0, 10));
        setSelectedIndex(0);
        setState("results");
      }
    } catch {
      setError("Search failed. Check your internet connection.");
      setState("input");
    }
  }

  async function fetchAndConfirm(result: SearchResult) {
    setState("fetching");
    setError(null);

    try {
      const song = await getLyricsById(result.id);
      if (song) {
        setFetchedSong(song);
        const exists = await songExists(song.title, song.artist);
        setAlreadySaved(exists);
        const count = await getSongCount();
        setSongCount(count);
        setState("confirm");
      } else {
        setError("Could not fetch lyrics for this song.");
        setState("results");
      }
    } catch {
      setError("Failed to fetch lyrics. Try again.");
      setState("results");
    }
  }

  async function handleConfirmAction(action: "play" | "save" | "saveAndPlay") {
    if (!fetchedSong) return;

    if (action === "play") {
      onSelect(fetchedSong);
      return;
    }

    if (alreadySaved) {
      setMessage("Song already saved!");
      if (action === "saveAndPlay") {
        setTimeout(() => onSelect(fetchedSong), 500);
      }
      return;
    }

    if (songCount >= MAX_SONGS) {
      setMessage(`Limit reached (${MAX_SONGS} songs). Delete some to save more.`);
      return;
    }

    const filename = await saveSong(fetchedSong);
    if (filename) {
      setMessage("Saved!");
      onSaved();
      if (action === "saveAndPlay") {
        setTimeout(() => onSelect(fetchedSong), 500);
      } else {
        // Go back to search after saving
        setTimeout(() => {
          setState("input");
          setQuery("");
          setFetchedSong(null);
          setMessage(null);
        }, 1000);
      }
    } else {
      setMessage("Failed to save song.");
    }
  }

  const canSave = !alreadySaved && songCount < MAX_SONGS;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Search for Lyrics (lrclib.net)
      </Text>
      <Text dimColor>
        Saved: {songCount}/{MAX_SONGS}
      </Text>

      {state === "input" && (
        <Box flexDirection="column" marginTop={1}>
          <Text>Enter song name or artist:</Text>
          <Box marginTop={1}>
            <Text color="green">&gt; </Text>
            <Text>{query}</Text>
            <Text color="gray">█</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to search, Esc to go back</Text>
          </Box>
        </Box>
      )}

      {state === "searching" && (
        <Box marginTop={1}>
          <Text color="yellow">Searching...</Text>
        </Box>
      )}

      {state === "fetching" && (
        <Box marginTop={1}>
          <Text color="yellow">Fetching lyrics...</Text>
        </Box>
      )}

      {state === "results" && (
        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>
            Found {results.length} results. ↑/↓ to navigate, Enter to select, Esc to search again
          </Text>
          <Box flexDirection="column" marginTop={1}>
            {results.map((result, index) => (
              <Box key={result.id}>
                <Text
                  color={index === selectedIndex ? "green" : undefined}
                  bold={index === selectedIndex}
                >
                  {index === selectedIndex ? "▸ " : "  "}
                  {result.title}
                  <Text dimColor> - {result.artist}</Text>
                  {result.album && <Text dimColor> ({result.album})</Text>}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {state === "confirm" && fetchedSong && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="green">
            {fetchedSong.title}
          </Text>
          <Text dimColor>by {fetchedSong.artist}</Text>
          <Text dimColor>({fetchedSong.lyrics.split(/\s+/).length} words)</Text>

          {alreadySaved && (
            <Box marginTop={1}>
              <Text color="yellow">Already saved locally</Text>
            </Box>
          )}

          <Box flexDirection="column" marginTop={1}>
            <Text>[1] Play now</Text>
            <Text color={canSave ? undefined : "gray"}>
              [2] Save & Play {!canSave && "(limit reached)"}
            </Text>
            <Text color={canSave ? undefined : "gray"}>
              [3] Save for later {!canSave && "(limit reached)"}
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Press 1, 2, or 3. Esc to go back.</Text>
          </Box>

          {message && (
            <Box marginTop={1}>
              <Text color="cyan">{message}</Text>
            </Box>
          )}
        </Box>
      )}

      {error && (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
}
