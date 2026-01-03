import { readdir, readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Song } from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LYRICS_DIR = join(__dirname, "../../lyrics");

export const MAX_SONGS = 20;

export async function loadAllSongs(): Promise<Song[]> {
  try {
    const files = await readdir(LYRICS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const songs: Song[] = [];

    for (const file of jsonFiles) {
      const song = await getSong(file);
      if (song) {
        songs.push(song);
      }
    }

    return songs;
  } catch {
    return [];
  }
}

export async function getSong(filename: string): Promise<Song | null> {
  try {
    const filePath = join(LYRICS_DIR, filename);
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);

    if (!data.title || !data.artist || !data.lyrics) {
      return null;
    }

    return {
      title: data.title,
      artist: data.artist,
      lyrics: data.lyrics,
      filename,
    };
  } catch {
    return null;
  }
}

export function getLyricsDir(): string {
  return LYRICS_DIR;
}

/**
 * Get count of saved songs
 */
export async function getSongCount(): Promise<number> {
  try {
    const files = await readdir(LYRICS_DIR);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

/**
 * Generate a safe filename from song title and artist
 */
function generateFilename(title: string, artist: string): string {
  const safe = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);

  return `${safe(artist)}-${safe(title)}.json`;
}

/**
 * Save a song to the lyrics folder
 * Returns the filename if successful, null if limit reached or error
 */
export async function saveSong(song: Song): Promise<string | null> {
  try {
    const count = await getSongCount();
    if (count >= MAX_SONGS) {
      return null;
    }

    // Ensure lyrics directory exists
    await mkdir(LYRICS_DIR, { recursive: true });

    const filename = song.filename || generateFilename(song.title, song.artist);
    const filePath = join(LYRICS_DIR, filename);

    const data = {
      title: song.title,
      artist: song.artist,
      lyrics: song.lyrics,
    };

    await writeFile(filePath, JSON.stringify(data, null, 2));
    return filename;
  } catch {
    return null;
  }
}

/**
 * Delete a song from the lyrics folder
 */
export async function deleteSong(filename: string): Promise<boolean> {
  try {
    const filePath = join(LYRICS_DIR, filename);
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a song already exists (by title and artist)
 */
export async function songExists(title: string, artist: string): Promise<boolean> {
  const songs = await loadAllSongs();
  return songs.some(
    (s) =>
      s.title.toLowerCase() === title.toLowerCase() &&
      s.artist.toLowerCase() === artist.toLowerCase()
  );
}
