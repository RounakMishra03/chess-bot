# ♟️ Chess-Bot: Adaptive AI Opponent & Mistake Coach

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![chess.js](https://img.shields.io/badge/Rules-chess.js-green)](https://github.com/jhlywa/chess.js)
[![License](https://img.shields.io/badge/License-Private-red)]()

A full-stack, pedagogical chess web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It combines an organic **human-like chess engine** that adapts to your skill level with an intelligent **Mistake Coach** that isolates your biggest blunders and explains how to improve in plain, friendly language.

---

## 🌟 The Core Novelty

Most chess engines (like Stockfish) are superhuman calculators. When lowered to beginner levels, they play either unnaturally robotic or make absurd random sacrifices (like donating their Queen for nothing).

**Chess-Bot solves this with two key innovations:**

### 1. Human-Like Adaptive Bot ("Alex")
Instead of rigid min-max evaluation, our engine models authentic human psychology:
* **Controlled Inaccuracy**: Selects organically from the top 2–3 natural human moves rather than calculating the single sharpest computer variation.
* **Realistic Thinking Delays**: Recaptures and forced moves happen almost instantly (~300ms), while complex positions cause realistic thinking pauses (~1.2s to 2.0s).
* **Simulated Human Blind Spots**: Emulates common club-player oversights, such as missing long backward diagonal bishop retreats.
* **Adaptive Difficulty**: Actively senses how you are doing in real time. If you fall behind, it relaxes pressure to give you comeback opportunities; if you are dominating, it sharpens its defense to keep matches gripping!

### 2. The Mistake Coach & Blunder Practice Loop
After a match, chess players often ask: *"Where did I lose the game?"* 
Instead of dumping confusing numerical evaluation graphs (`+3.42`), the Coach:
1. Replays your game move-by-move to calculate centipawn swings.
2. Isolates your **top 3 blunders**.
3. Categorizes each blunder with clear labels: **Hanging Piece**, **Missed Win**, **Lost Tempo**, or **King Safety**.
4. Opens an interactive review board showing **"What You Played"** (highlighted in red) vs. **"Recommended Move"** (highlighted in emerald).
5. **Automatically converts your past blunders into interactive tactical puzzles** in **Blunder Practice Mode** so you can immediately replay and conquer your weaknesses!

---

## 🛠️ Architecture & Tech Stack

| Technology | Purpose & Architectural Role |
| :--- | :--- |
| **Next.js 16 + TypeScript (App Router)** | Provides strict type safety, fast routing, and clean modular component structure. |
| **Tailwind CSS v4** | Modern, responsive dark-mode styling without bloated CSS files. |
| **chess.js** | Handles 100% of official FIDE chess rules, legal move generation, check/checkmate detection, and board state transitions. |
| **react-chessboard** | Drag-and-drop board interface with smooth piece animations and custom square highlights. |
| **Custom Engine (Minimax + Alpha-Beta)** | Built from scratch in TypeScript featuring Move Ordering (MVV-LVA) and Piece-Square Tables (PST). |
| **Web Worker** | Runs heavy tree searches on an isolated background thread so the browser UI never stutters or lags. |
| **Stockfish WASM** | Browser-native grandmaster engine available in `public/stockfish/` for deep game evaluation. |
| **PWA Manifest** | Allows installing Chess-Bot directly to iOS and Android home screens as a native-feeling app. |

---

## 📂 Project Structure

```
chess-bot/
├── app/
│   ├── layout.tsx             # Root layout with PWA meta & theme configuration
│   ├── page.tsx               # Main product navigation (Arena, Practice, Dashboard)
│   └── globals.css            # Tailwind styling entrypoint
├── components/
│   ├── ChessGame.tsx          # Main interactive chessboard and game controller
│   ├── BlunderPractice.tsx    # Interactive tactical puzzle arena generated from mistakes
│   ├── ProgressDashboard.tsx  # Analytics, win rate, and blunder vulnerability diagnosis
│   └── MistakeCoachModal.tsx  # Post-game side-by-side visual blunder review
├── lib/
│   ├── engine/
│   │   ├── constants.ts       # Centipawn material values (P=100, N=300, etc.)
│   │   ├── pst.ts             # 8x8 Piece-Square Tables for positional bonuses
│   │   ├── evaluate.ts        # Combined material + positional board evaluation
│   │   ├── minimax.ts         # Phase 2 Minimax algorithm (depth 2)
│   │   ├── alphaBeta.ts       # Phase 3 Alpha-Beta pruning + Move Ordering (MVV-LVA)
│   │   ├── humanBot.ts        # Phase 4 Human-like inaccuracy and thinking delays
│   │   ├── adaptive.ts        # Dynamic rating and difficulty auto-tuner
│   │   └── benchmark.ts       # Depth 4 speed verification
│   ├── coach/
│   │   └── analyzer.ts        # Move-by-move blunder detection and coaching tips
│   └── storage/
│       └── gameStorage.ts     # Game history and practice puzzle persistence
├── workers/
│   └── engine.worker.ts       # Dedicated Web Worker running engine searches off-thread
├── public/
│   ├── manifest.json          # Progressive Web App configuration
│   └── stockfish/             # Stockfish WASM engine binaries
└── docs/
    ├── ROADMAP.md             # Master phase-by-phase engineering roadmap
    └── Chess-Bot-Roadmap.pdf  # Styled, print-ready roadmap document
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js**: v18.0.0 or later (v20+ recommended)
* **npm**: v9.0.0 or later

### Installation & Run

1. Clone your private repository:
   ```bash
   git clone https://github.com/RounakMishra03/chess-bot.git
   cd chess-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🌐 Deploying to Vercel in 2 Minutes

Deploying Chess-Bot to production is completely free and takes two minutes via Vercel:

1. Push all your latest commits to GitHub (`main` branch).
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New..."** -> **"Project"**.
4. Select your private **`RounakMishra03/chess-bot`** repository and click **Import**.
5. Leave all build settings at their defaults:
   * **Framework Preset**: Next.js
   * **Root Directory**: `./`
   * **Build Command**: `next build --webpack`
6. Click **Deploy**.
7. In ~60 seconds, Vercel will provide your live, public HTTPS URL (e.g., `https://chess-bot-xxx.vercel.app`)!

---

## 👥 Playtesting Guide (Test with 5–10 Friends)

To gather high-value feedback, share your live Vercel URL with 5–10 friends of varying chess experience (beginners, club players, casual players) and ask them to complete this simple 5-minute test:

### Testing Script:
1. **Play 1 Game in the Arena**:
   * Play against **Alex (Human-Like Bot)** with **Adaptive Level Tuning** turned ON.
   * *Ask them*: "Did the bot's moves and pauses feel like playing a real person or a machine?"
2. **Review with the Mistake Coach**:
   * Click **"Review Mistakes with Coach"** (or click it from the game-over screen).
   * *Ask them*: "Were the coaching explanations easy to understand without confusing chess theory?"
3. **Solve 2 Puzzles in Blunder Practice**:
   * Click the **"Blunder Practice"** tab and solve 2 puzzles.
   * *Ask them*: "Did replaying your past mistakes make you feel more confident about spotting tactics?"
4. **Mobile Check**:
   * Open the link on an iPhone or Android phone.
   * *Ask them*: "Is dragging pieces smooth on touchscreens?"

---

## 📜 Development Roadmap Milestones

- [x] **Phase 0: Setup** (Next.js 16, TypeScript, Tailwind CSS, chess.js, react-chessboard)
- [x] **Phase 1: Playable Board** (Legal move rules, game state banners, New Game, Undo, Flip)
- [x] **Phase 2: Bot v1** (Standard piece values, material evaluation, Minimax 2 plies)
- [x] **Phase 3: Smarter & Faster Bot** (Alpha-Beta pruning, Move Ordering, PST, Web Worker)
- [x] **Phase 4: Human-Like Bot** (Controlled inaccuracy, simulated blind spots, dynamic adaptive ELO)
- [x] **Phase 5: Mistake Coach** (Stockfish WASM, centipawn drop analysis, visual review highlights, plain-English tips)
- [x] **Phase 6: Real Product** (Blunder Practice Mode, Progress Dashboard, Game persistence, PWA manifest)
- [x] **Phase 7: Launch & Polish** (Vercel production guide, playtesting protocol, comprehensive README)

---

## 💡 Acknowledgements & Credits
* **chess.js**: Official FIDE move generation and board state validation.
* **react-chessboard**: Drag-and-drop chessboard UI component.
* **Stockfish**: Open-source chess evaluation engine.
* **Antigravity Pair Programming**: Built with care and senior engineering guidance.
