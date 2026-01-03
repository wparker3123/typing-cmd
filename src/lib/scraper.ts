/**
 * Lyrics scraper using lrclib.net API
 * https://lrclib.net/docs
 *
 * No API key required. User-agent recommended.
 */

import type { Song } from "../types/index.js";

const API_BASE = "https://lrclib.net/api";
const USER_AGENT = "TypeCMD/0.1.0 (https://github.com/wparker3123/typing-cmd)";

export interface LrcLibTrack {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string | null;
  duration: number | null;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export interface SearchResult {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  hasLyrics: boolean;
}

/**
 * Search for songs by query string
 */
export async function searchSongs(query: string): Promise<SearchResult[]> {
  try {
    const url = new URL(`${API_BASE}/search`);
    url.searchParams.set("q", query);

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      return [];
    }

    const tracks = (await response.json()) as LrcLibTrack[];

    return tracks
      .filter((track) => !track.instrumental && track.plainLyrics)
      .map((track) => ({
        id: track.id,
        title: track.trackName,
        artist: track.artistName,
        album: track.albumName,
        hasLyrics: !!track.plainLyrics,
      }));
  } catch {
    return [];
  }
}

/**
 * Get lyrics by track name and artist
 */
export async function getLyricsBySearch(
  trackName: string,
  artistName: string
): Promise<Song | null> {
  try {
    const url = new URL(`${API_BASE}/get`);
    url.searchParams.set("track_name", trackName);
    url.searchParams.set("artist_name", artistName);

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      return null;
    }

    const track = (await response.json()) as LrcLibTrack;

    if (!track.plainLyrics) {
      return null;
    }

    return {
      title: track.trackName,
      artist: track.artistName,
      lyrics: track.plainLyrics,
    };
  } catch {
    return null;
  }
}

/**
 * Get lyrics by lrclib track ID
 */
export async function getLyricsById(id: number): Promise<Song | null> {
  try {
    const response = await fetch(`${API_BASE}/get/${id}`, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      return null;
    }

    const track = (await response.json()) as LrcLibTrack;

    if (!track.plainLyrics) {
      return null;
    }

    return {
      title: track.trackName,
      artist: track.artistName,
      lyrics: track.plainLyrics,
    };
  } catch {
    return null;
  }
}
