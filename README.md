# The Receipts

A plain-English, source-cited record of what the Trump administration has done — and promised but not done — since the 2024 election. Every entry has a date, a one-line summary, a longer explanation written for someone hearing about it for the first time, and links to reputable sources (AP, Reuters, NPR, court filings, government documents, major outlets).

196 entries across nine categories:

- **Crypto & Personal Profit** — WLF, USD1, the MGX $2B / UAE chips linkage, the memecoin, Justin Sun, the Qatar jet, golf costs, the $230M DOJ demand
- **Pardons & Rule of Law** — Jan 6, CZ, the pardon-lobbying economy, Comey/James, law-firm orders, the Bove judgeship
- **Immigration & Enforcement** — CECOT, Abrego Garcia, Alligator Alcatraz, Guantánamo, city surges, agent shootings, IRS-ICE data sharing
- **Government, Health & Science** — DOGE, USAID, RFK Jr., climate rollbacks, agency purges, CFPB, NSF/NASA cuts
- **Economy, Tariffs & Foreign Policy** — Liberation Day, the Fed fight, Argentina, Ukraine/Gaza/Iran/Venezuela, TikTok, the Intel stake
- **Press, Speech & Democracy** — media settlements and lawsuits, Epstein files, gerrymandering, No Kings, VOA, ideological deportations
- **Civil Rights & Culture** — trans policy, DEI purges, military history scrubbing, Confederate names, consent decrees
- **Military & National Security** — Signalgate, the generals purge, Quantico, Golden Dome, border military zones
- **Promises vs. Reality** — what was said vs. what happened, with the receipts

## Running it

It's a fully static site — no build step, no dependencies.

```sh
open index.html
# or serve it:
python3 -m http.server 8000
```

## Features

- Chyron ticker cycling every headline; live "Day N of the second term" counter
- Full-text search + color-coded category filters + newest/oldest sort
- Month markers down the timeline; expand/collapse all
- "🎲 show me one I don't know" random-entry shuffle
- Deep links — every entry has its own URL hash and a copy-link button

## Structure

- `index.html` — the page shell
- `styles.css` — all styling
- `app.js` — rendering, search, filters, ticker, deep links
- `data.js` — the content: `window.ENTRIES`, an array of entry objects

## Adding or correcting an entry

Edit `data.js`. Each entry:

```js
{
  date: "2025-05-01",            // YYYY-MM-DD, or YYYY-MM if only the month is known
  category: "Crypto & Personal Profit",
  title: "Short headline",
  summary: "The one-liner shown before expanding.",
  details: "The full plain-English explanation.",
  sources: [{ name: "Reuters", url: "https://..." }]
}
```

Corrections must come with sources.
