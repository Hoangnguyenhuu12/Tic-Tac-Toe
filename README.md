# X-O-Game

A clean, responsive Tic-Tac-Toe / Gomoku web game built with vanilla HTML, CSS, and JavaScript — no frameworks or dependencies required.

🔗 **Live demo:** `https://Hoangnguyenhuu12.github.io/X-O-Game`

---

## Features

- **Two game modes** — Classic 3×3 (3 in a row) and Gomoku 15×15 (5 in a row)
- **Two player modes** — Local 2-player or vs CPU
- **Smart AI** — Minimax algorithm for Classic; threat-scoring heuristic for Gomoku
- **Score tracking** — Wins and draws persist across rounds
- **Dark / Light mode** — Toggle in the top-right corner
- **Animated marks** — Satisfying pop-in animation on every move
- **Win highlight** — Winning cells are outlined in the player's color
- **SVG favicon** — Custom X-in-circle logo shown in the browser tab

---

## Project Structure

```
xoxo/
├── index.html       # Markup only — no inline styles or scripts
├── css/
│   └── style.css    # Theme variables, layout, and component styles
└── js/
    └── game.js      # All game logic: state, AI, board builder, controls
```

---

## How to Run Locally

No build step needed. Just open the file in a browser:

```bash
# Clone the repo
git clone https://github.com/Hoangnguyenhuu12/X-O-Game.git
cd X-O-Game

# Open directly
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or use a local server (recommended to avoid font-loading quirks):

```bash
# Python
python -m http.server 3000

# Node.js
npx serve .
```

Then visit `http://localhost:3000`.

---

## Deploy to GitHub Pages

1. Push the project to a **public** GitHub repository.
2. Go to **Settings → Pages**.
3. Under *Source*, select **Deploy from a branch → main → / (root)**.
4. Save — your game will be live at `https://Hoangnguyenhuu12.github.io/X-O-Game` within a minute.

---

## Game Rules

### Classic (3×3)
Standard Tic-Tac-Toe. Get **3 marks in a row** — horizontally, vertically, or diagonally — before your opponent.

### Gomoku (15×15)
Get **5 marks in a row** in any direction. The board is 15×15, making strategy and blocking much more important.

---

## AI Design

| Mode    | Algorithm | Notes |
|---------|-----------|-------|
| Classic | Minimax   | Plays perfectly — cannot be beaten, only drawn |
| Gomoku  | Heuristic | Scores each empty cell by counting threats in all 4 directions, then picks the best attack or block |

---

## Customisation

All visual tokens are CSS variables in `style.css`:

```css
:root {
  --x-color:   #D85A30;  /* X mark colour */
  --o-color:   #185FA5;  /* O mark colour */
  --cell-size: 120px;    /* overridden by JS per map mode */
}
```

Map sizes and win lengths are defined in `game.js`:

```js
const CONFIGS = {
  classic: { size: 3,  win: 3, cellPx: 120, markPx: 68, gap: 6,  rootW: 480 },
  gomoku:  { size: 15, win: 5, cellPx: 38,  markPx: 20, gap: 2,  rootW: 720 },
};
```

To add a new map mode, just add an entry to `CONFIGS` and a toggle button in `index.html`.

---

## Tech Stack

- **HTML5** — semantic markup, SVG favicon via data URI
- **CSS3** — custom properties, CSS Grid, keyframe animations
- **Vanilla JavaScript** — no libraries or build tools

---

## License

MIT — free to use, modify, and distribute.
