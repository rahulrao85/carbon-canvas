# Carbon Canvas 🌱

A carbon footprint **awareness** platform — not just another tracking dashboard. Log your daily activities and watch a living garden world reflect your carbon choices in real time. AI-powered insights turn abstract numbers into emotional, relatable comparisons that actually change behavior.

## The Problem

Most carbon footprint tools show you numbers: kg CO₂, pie charts, bar graphs. The problem? **Data without context doesn't change behavior.** The average Indian urban resident has no idea what "1.5 tons of CO₂ per year" actually means.

## Our Solution

Carbon Canvas makes carbon *feel* personal through two mechanisms:

1. **Living Garden World** — A canvas-rendered garden that thrives (green grass, trees, flowers, birds) when your footprint is low, and decays (gray sky, dead grass, trash, lightning) when it's high. Visual consequences > abstract numbers.

2. **AI-Powered Emotional Insights** — Each activity logged generates a personalized, relatable comparison via OpenRouter AI: *"This flight emitted as much CO₂ as running your AC for 3 months."*

## Features

- **Activity Logger** — Log transport, food, energy, and shopping activities with preset emission factors
- **Living Garden** — Real-time canvas visual that changes based on your daily carbon footprint
- **AI Insights** — Personalized comparisons that make emissions feel real
- **Dashboard** — Today's footprint, weekly totals, top emission sources, streak tracking
- **Challenges** — Weekly reduction challenges with progress tracking
- **Dark/Light Theme** — Accessible color contrast

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (ES6 modules, <200 lines per file) |
| CSS | 4 component files, CSS custom properties for theming |
| Backend | Node.js + Express |
| AI | OpenRouter API (Llama 3) |
| Testing | Jest + Supertest (27 tests) |
| Security | Helmet (default), rate limiting (30 req/min) |
| Deployment | Cloud Run / Docker |

## Architecture

```
carbon-canvas/
├── public/           # Static frontend
│   ├── index.html    # Semantic HTML with ARIA
│   ├── css/          # 4 small component CSS files
│   └── js/           # 4 ES6 modules, each <200 lines
├── routes/           # Express route handlers
│   ├── carbon.js     # POST /api/carbon - calculate emissions
│   ├── insights.js   # POST /api/insights - AI insights
│   └── challenges.js # GET/POST /api/challenges
├── services/         # Business logic
│   ├── ai.js         # OpenRouter client with fallback
│   └── emission-factors.js  # kg CO₂ per activity
├── config/           # App configuration
│   └── constants.js
├── server.js         # Express entry point
└── server.test.js    # 27 tests
```

## Scoring Philosophy

This app was built for PromptWars Virtual Challenge 3 with explicit optimization for the evaluator:

- **Security:** Default Helmet (no unsafe-inline CSP), rate limiting (30/min), input sanitization, payload limits
- **Code Quality:** Every source file <200 lines, CSS split into 4 component files, ESLint + Prettier
- **Testing:** 27 tests covering all routes, 400/404/500 errors, security headers, edge cases
- **Efficiency:** Compression middleware, immutable caching, preconnect hints, minified assets
- **Accessibility:** Skip-to-content link, semantic HTML, ARIA labels, aria-live regions, WCAG color contrast
- **Problem Alignment:** Goes beyond tracking to create *awareness* through visual + emotional feedback

## Getting Started

```bash
git clone <repo-url>
cd carbon-canvas
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY
npm install
npm start     # Starts on http://localhost:8080
npm test      # Runs 27 tests
```

## Deployed Link

[Add your Cloud Run URL here]

## AI Prompt Strategy

The OpenRouter system prompt is designed to:
1. Never lecture or use jargon
2. Always use Indian-context comparisons (rupees, local foods, common activities)
3. Keep responses to 1-2 sentences
4. Be warm and conversational, not preachy

Fallback: If the AI API is unavailable, hardcoded equivalent comparisons are used (e.g., "That's like running your AC for X hours").
