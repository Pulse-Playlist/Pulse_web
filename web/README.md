# PULSE Web — Next.js BPM & Running Cadence Inspector

Interactive Next.js (App Router + TypeScript + Tailwind CSS) dashboard for exploring the PULSE 465-track music database, synchronized with a precision Web Audio lookahead metronome and Running Playlist curator.

## Features
- **465 DSP-Analyzed Tracks**: Real audio previews from Apple Music (.m4a) with raw BPM, cadence mode (native/doubled/halved), beat clarity, timing stability, and running score.
- **Category Tabs**: Filter between `ALL` (465), `BAND` (125), `KPOP` (115), `ROCK` (115), and `HIPHOP` (110).
- **Cadence Range Slider**: Filter between 110–195 SPM with presets (Warmup, Aerobic, Easy, Marathon, Sprint) and selectable tolerance (±3, ±5, ±10 SPM).
- **Precision Web Audio Metronome**: Lookahead clock scheduling with sub-millisecond precision, sound synthesis (woodblock, hihat, beep, rimshot), 1x/2x cadence multiplier, and ±20ms phase micro-nudging.
- **Running Playlist Drawer**: Build, reorder, calculate aggregate SPM/time, and export to M3U or text.
- **Next.js App Router API**: `/api/songs` route handler providing query filtering and summary statistics.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```
