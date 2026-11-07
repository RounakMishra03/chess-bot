# Chess-Bot Roadmap ♟️

A friendly, step-by-step master plan for building a smart, human-like chess web application with an integrated AI blunder coach.

---

## 1. Project Goal

Build a complete, responsive web application where players of any skill level can play against an adaptive AI chess engine that feels like a real human opponent, and receive constructive post-game coaching that pinpoints blunders and explains them in simple, encouraging language.

---

## 2. Novelty

Most chess engines (like Stockfish) play either perfectly or unnaturally robotic when nerfed. **Chess-Bot** introduces two key innovations:
1. **Human-Like Adaptive Bot**: Rather than making random blunders or playing like a calculator, the bot simulates real human psychological traits—such as time trouble, tunnel vision, tactical blind spots, and natural inaccuracies based on the player's rating.
2. **Mistake Coach**: After each game, instead of overwhelming the player with abstract evaluation graphs and complex computer lines (+3.42, 14. Nf3 exd4), the coach isolates the player's **top 3 blunders**, tags them with clear human concepts (e.g., *"Hanging Piece"*, *"Missed Fork"*), and explains why the move was a mistake in plain, friendly language.

---

## 3. Tech Stack & One-Line Rationale

| Technology | Purpose & One-Line Rationale |
| :--- | :--- |
| **Next.js + TypeScript (App Router)** | Industry-standard React framework providing strict type safety, fast routing, and clean project structure. |
| **Tailwind CSS** | Utility-first styling for rapid, polished, and fully responsive UI design without writing bloated CSS files. |
| **chess.js** | Reliable library that handles all official chess rules, move validation, and board state transitions out of the box. |
| **react-chessboard** | Flexible, pre-built drag-and-drop chessboard UI component with smooth piece animations. |
| **Custom Engine (TS + Web Worker)** | Our own Minimax + Alpha-Beta pruning AI engine running in a background thread to prevent UI freezing. |
| **Stockfish (WASM)** | High-powered, browser-native chess engine used to accurately detect blunders and benchmark our custom bot. |
| **LLM API (Later Phase)** | Translates cold engine evaluations into simple, friendly, student-level coaching tips (kept optional and cost-effective). |
| **Supabase (Later Phase)** | Scalable authentication and database service to handle user accounts, saved games, and puzzle histories. |
| **Vercel** | Seamless, zero-configuration cloud hosting platform designed specifically for fast Next.js deployments. |

> **Rule on Rules**: We will never write our own chess rules or move validation from scratch. `chess.js` guarantees 100% standard FIDE rules compliance.

---

## 4. Phase-by-Phase Roadmap

---

### Phase 0: Setup & Foundations (Completed)
* **Goal**: Establish a clean, error-free Next.js project with TypeScript, Tailwind CSS, core chess libraries, and an organized directory structure.
* **Steps**:
  1. Initialize Next.js project with TypeScript, Tailwind CSS, and App Router (`create-next-app`).
  2. Install core chess dependencies: `chess.js` and `react-chessboard`.
  3. Set up a clean folder structure (`/components`, `/lib/engine`, `/workers`, `/types`, `/docs`).
  4. Configure initial `.gitignore` (ignoring `node_modules`, `.next`, `.env*`, etc.).
* **Done When**:
  - [x] Dev server starts cleanly with `npm run dev`.
  - [x] Basic Next.js page loads in the browser without console errors.
  - [x] Project dependencies (`chess.js`, `react-chessboard`, `tailwindcss`) are installed and verified.

---

### Phase 1: Playable Board vs. Random Bot (Completed)
* **Goal**: Build a fully interactive, responsive chessboard where the user can play full legal games against a bot that picks legal moves at random.
* **Steps**:
  1. Render `react-chessboard` wired to an active `chess.js` game state.
  2. Implement legal move validation and piece drop handling.
  3. Build a simple "Random Move" bot that responds after the player's turn.
  4. Add game state banners: Check, Checkmate, Stalemate, and Draw conditions.
  5. Add essential game controls: **New Game**, **Undo Move**, and **Flip Board**.
* **Done When**:
  - [x] Pieces can be dragged and dropped only to legal squares.
  - [x] The random bot automatically responds with a legal move.
  - [x] Check and game-over states (checkmate/stalemate/draw) are clearly displayed.
  - [x] "New Game", "Undo", and "Flip Board" buttons work seamlessly without errors.

---

### Phase 2: Bot v1 (Basic Minimax) (Completed)
* **Goal**: Create our first intelligent bot that values pieces and calculates short sequences ahead to capture hanging pieces and avoid immediate traps.
* **Steps**:
  1. Define standard material values: Pawn = 100, Knight = 300, Bishop = 300, Rook = 500, Queen = 900, King = 20000.
  2. Write a board evaluation function (`lib/engine/evaluate.ts`) that sums total white material minus total black material.
  3. Implement the classic Minimax search algorithm (`lib/engine/minimax.ts`) with a fixed depth of 2 plies (1 full turn ahead).
  4. Hook Bot v1 into the board UI with a toggle to choose between "Random Bot" and "Bot v1 (Minimax)".
* **Done When**:
  - [x] Bot v1 reliably captures unprotected (hanging) player pieces.
  - [x] Bot v1 avoids moving its own valuable pieces into immediate capture.
  - [x] Calculation completes in under 200ms without noticeable lag.

---

### Phase 3: Smarter & Faster Bot
* **Goal**: Upgrade the bot's speed and positional understanding using Alpha-Beta pruning, Piece-Square tables, move ordering, and Web Workers.
* **Steps**:
  1. Add **Alpha-Beta Pruning** to eliminate unnecessary search branches, allowing deeper search (depth 3-4).
  2. Implement **Piece-Square Tables (PST)** to reward good habits (controlling center, developing knights/bishops, king safety).
  3. Implement **Move Ordering** (evaluating captures and checks first) to maximize alpha-beta cutoffs.
  4. Move engine calculations into a dedicated **Web Worker** so the UI never stutters or freezes during search.
  5. Expose difficulty presets (Easy: depth 2; Medium: depth 3; Hard: depth 4).
  6. Benchmark bot performance and move quality against Stockfish WASM.
* **Done When**:
  - [ ] Bot reaches depth 4 in under 1 second per move.
  - [ ] Board UI animations stay completely smooth while the bot thinks (Web Worker verification).
  - [ ] Bot demonstrates basic opening development and positional awareness.
  - [ ] Bot easily defeats Bot v1 in test matches.

---

### Phase 4: Human-Like Bot
* **Goal**: Transform the bot from a mechanical calculator into an opponent that feels human, complete with realistic tendencies, blind spots, and adaptive skill.
* **Steps**:
  1. Model controlled inaccuracy: introduce small evaluation noise so the bot doesn't always pick the robotic #1 move.
  2. Simulate human blind spots (e.g., missing long diagonal bishop retreats, subtle pawn pins).
  3. Add human-like thinking delay (fast moves on obvious recaptures, longer pauses in complex positions).
  4. Create an **Adaptive Difficulty System**: dynamic rating adjustment that tunes difficulty up or down based on recent player moves and score advantage.
* **Done When**:
  - [ ] Moves feel organic rather than machine-precise.
  - [ ] Bot's move timing mimics human reflection speeds.
  - [ ] A beginner can enjoy close games without being brutally crushed or facing absurd random blunders.

---

### Phase 5: Mistake Coach
* **Goal**: Add a post-game review system powered by Stockfish WASM that highlights the player's 3 biggest mistakes and explains them in simple words.
* **Steps**:
  1. Integrate Stockfish WASM into a background review worker.
  2. Analyze the game move-by-move to calculate evaluation swings (centipawn loss).
  3. Identify the player's top 3 blunders (biggest drop in win probability).
  4. Categorize mistakes with clear tags: *Hanging Piece*, *Missed Win*, *Lost Tempo*, *Failed Pin*.
  5. Highlight the blunder and the recommended move on an interactive review board.
  6. Provide plain-English coaching explanations (with optional LLM integration for personalized advice).
* **Done When**:
  - [ ] Post-game report generates automatically within 5-10 seconds of game completion.
  - [ ] Top 3 blunders are clearly displayed on a review timeline with visual board arrows/highlights.
  - [ ] Every blunder includes a friendly explanation of why the move failed and what should have been played.

---

### Phase 6: Real Product (User Experience & Features)
* **Goal**: Turn the app into a full-featured personal chess training platform with user accounts, game history, custom practice puzzles, and mobile support.
* **Steps**:
  1. Add authentication with Supabase (Google OAuth & Email login).
  2. Save completed games and blunder reports to Supabase database.
  3. Build a "Progress Dashboard" tracking win/loss record, accuracy trends, and common mistake types.
  4. Build a **"Blunder Practice Mode"**: automatically turns the user's past mistakes into bite-sized tactical puzzles.
  5. Polish responsive mobile layout and configure Progressive Web App (PWA) support for mobile home screen installation.
* **Done When**:
  - [ ] Users can sign in, review past games, and see their improvement metrics.
  - [ ] Blunder practice mode generates playable puzzles sourced from the player's actual games.
  - [ ] App is fully responsive and touch-friendly on iOS and Android viewports.

---

### Phase 7: Launch & Polish
* **Goal**: Deploy the web app to production on Vercel, test with real users, fix user experience friction points, and prepare documentation.
* **Steps**:
  1. Deploy production build on Vercel with production environment variables.
  2. Conduct user testing with 5–10 friends across different devices and ratings.
  3. Gather feedback and address top UI/UX and gameplay issues.
  4. Write a comprehensive, student-friendly `README.md` with feature overviews, architecture diagram, and screenshots.
* **Done When**:
  - [ ] App is live on a public Vercel URL with SSL and zero critical console errors.
  - [ ] At least 5 external users have completed games and post-game reviews successfully.
  - [ ] `README.md` is complete with clear setup instructions and visuals.

---

## 5. Development Principles & Git Workflow

- **One Phase at a Time**: Never skip ahead or add unrequested features.
- **Student-First Explanations**: Every pull request, commit, and code block is explained block-by-block with the *why* clearly stated.
- **Private Repository**: All work will remain in a private GitHub repository (`chess-bot`).
- **Feature Branching**: Each phase gets its own dedicated branch (e.g., `phase-1-board`), merged to `main` only upon explicit approval.
- **Security**: Never commit secrets, passwords, or API keys (`.gitignore` enforced from Step 0).
