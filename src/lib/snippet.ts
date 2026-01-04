import type { Song, Snippet } from "../types/index.js";

export function extractSnippet(
  song: Song,
  minWords: number = 30,
  maxWords: number = 50
): Snippet {
  // Clean up lyrics: normalize whitespace, remove extra line breaks
  const cleanedLyrics = song.lyrics
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleanedLyrics.split(" ").filter((w) => w.length > 0);

  if (words.length <= maxWords) {
    // If the song is short, use all of it
    return {
      text: words.join(" "),
      wordCount: words.length,
      sourceTitle: song.title,
      sourceArtist: song.artist,
    };
  }

  // Pick a random word count between min and max
  const targetWordCount =
    Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;

  // Pick a random starting position that allows for the full snippet
  const maxStartIndex = words.length - targetWordCount;
  const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));

  const snippetWords = words.slice(startIndex, startIndex + targetWordCount);

  return {
    text: snippetWords.join(" "),
    wordCount: snippetWords.length,
    sourceTitle: song.title,
    sourceArtist: song.artist,
  };
}
