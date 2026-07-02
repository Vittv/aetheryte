# Contributing

## Setup

Clone your fork:

```sh
git clone <https://github.com/your-fork>
```

Go into your directory and install dependencies:

```sh
cd aetheryte
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Code quality

```sh
npm run check      # lint + format + organize imports
```

Linting and formatting are handled by [Biome](https://biomejs.dev), configured with 2-space indent, double quotes, and import organization on save. The config also respects `.gitignore`.

## Project structure

```
data/
  duties.json          # index of all duties (used by waymark builder)
  duty/
    extreme/           # JSON with markers, videos, links per duty
    savage/
    ultimate/
    criterion/
    unreal/
    chaotic/
src/
  pages/content/duty/  # MDX guide pages (one per duty)
  pages/tools/         # Waymark builder and other future tools
  assets/images/       # Banner images for each duty
  components/          # Shared UI components
```

## Writing a new guide

Every new guide needs up to three things:

### 1. Banner image

Place an image under `src/assets/images/`. For duties, use the **official duty image** (the one you see in the duty list).

### 2. JSON data file (optional for non-duty guides)

Create a file under `data/duty/<category>/<slug>.json`. This stores structured data that would be tedious to write manually every time: planner links, embedded YouTube URLs, marker presets, etc.

Example structure:

```json
{
  "name": "Worqor Lar Dor (Extreme)",
  "slug": "dtex1",
  "current": true,
  "party-finder-summary": "RMMR | South to North | First Feather",
  "markers": [
    {
      "Name": "NASE - Worqor Lar Dor",
      "MapID": 833,
      "A": { "X": 95.0, "Y": 0.0, "Z": 95.0, "ID": 0, "Active": true }
    }
  ],
  "unlock": "https://..."
}
```

See existing files under `data/duty/` for reference.

### 3. Register in the duty index

Add an entry to `data/duties.json` with the slug, name, type, arena shape, and radius. The `order` field controls sort order within a category, such order is important so the content is always displayed chronologically.

```json
{
  "slug": "my-duty",
  "name": "My Duty (Extreme)",
  "type": "extreme",
  "shape": "square",
  "radius": 20,
  "order": 1
}
```

### 4. MDX guide page

Create a file under `src/pages/content/duty/<category>/<slug>.mdx`. The file typically:

- Has frontmatter with a `date` field
- Imports the banner image and JSON data
- Documents the party finder summary, strategy notes, marker codes, and embedded resources

Example:

```mdx
---
date: 2026-06-11
---

import contentImg from "../../../../assets/images/my-duty.png"
import data from "../../../../../data/duty/extreme/my-duty.json"

# My Duty (Extreme)

<p className="frontmatter">Last updated: <span className="content-date">{frontmatter.date}</span></p>

<img src={contentImg} alt="my duty banner" />
```

### Non-duty guides

These likely won't need an official banner image or a JSON data entry. The scope of the site is flexible, we can always expand, but shouldn't reinvent the wheel when good tools already exist (e.g. [teamcraft](https://github.com/ffxiv-teamcraft/ffxiv-teamcraft) for crafting).

## Adding a waymark preset

Waymark presets live in the `markers` array of each duty's JSON data file. The waymark builder reads them directly. If a duty has a new or updated preset, just update the JSON.

## Pull requests

Keep PRs focused on a single change. Describe what and why, not how. If it's a new guide, include screenshots of the rendered page if possible.

> Thank you for your interest and contribution!
