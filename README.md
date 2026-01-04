# TypeCMD - Lyrics Typing Game

A command-line typing game using song lyrics.

## Features

| Feature | Description |
|---------|-------------|
| **Typing game** | Type lyrics with real-time feedback (green=correct, red=error) |
| **Error blocking** | Must fix mistakes with backspace before continuing |
| **WPM & accuracy** | Live stats during gameplay |
| **Random snippets** | 30-50 word excerpts, different each play |
| **Online search** | Fetch lyrics from lrclib.net (no API key needed) |
| **Local storage** | Save up to 20 songs as JSON files |
| **High scores** | Top scores saved to `~/.typecmd-scores.json` |

## Usage

```bash
npm run dev      # Development
npm run build    # Build
npm start        # Run built version
```

**Controls:**
- Menu: `↑/↓` navigate, `Enter` select, `S` search online
- Game: Type lyrics, `Backspace` fix errors, `Esc` quit
- Results: `R` replay, `M` menu, `Q` quit

## Project Structure

```
src/
├── components/     # Ink UI components
│   ├── Game.tsx    # Main game orchestrator
│   ├── Menu.tsx    # Song selection
│   ├── Search.tsx  # Online lyrics search
│   ├── TypingLine.tsx  # Core typing UI
│   ├── Stats.tsx   # WPM/accuracy display
│   └── HighScores.tsx
├── lib/            # Business logic
│   ├── lyrics.ts   # Load/save local songs
│   ├── scraper.ts  # lrclib.net API client
│   ├── snippet.ts  # Extract random excerpts
│   ├── scoring.ts  # WPM/accuracy calculations
│   └── highscores.ts
└── types/          # TypeScript interfaces
lyrics/             # Local song JSON files
```

## Adding Songs

**Manually:** Create JSON files in `lyrics/`:
```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "lyrics": "Full lyrics text..."
}
```

**Via search:** Press `S` in menu, search, then save.
