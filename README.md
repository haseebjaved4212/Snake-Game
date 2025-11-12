# Snake Game

A responsive Snake game built with HTML, CSS and vanilla JavaScript. The project includes a nice dark UI with header pills showing High Score, Score and Time, a canvas-based game board with a subtle grid background, and a styled game-over modal.


---

## Features

- Fully responsive layout that adapts to different screen sizes and devices.
- Canvas-based game rendering for good performance.
- Keyboard and touch controls (arrow keys / WASD / swipe).
- Score tracking and High Score persisted to `localStorage`.
- Timer (MM:SS) showing time since the current game started.
- Start / Pause / Reset controls and a polished game-over modal with Restart/Close actions.
- CSS grid background for a classic Snake board appearance. The canvas draws the snake and food.

## Responsive design

- Mobile layout 
  ![mobile-layout](images/Mobile.png)

- Desktop layout 
  ![desktop-layout](images/laptop.png)


- Tablet layout 
  ![tablet-layout](images/Ipad.png)


## Project structure

```
Snake Game/
├─ index.html          # Main HTML page (UI, modal, controls)
├─ style.css           # Responsive styles and modal styling
├─ script.js           # Game logic, rendering, controls
├─ README.md           # This file
└─ images/             # (optional) images you can add (see below)
```



## How to run

Open `index.html` in your browser. On Windows PowerShell you can run:

```powershell
ii .\index.html
```

## Controls

- Start: Click the Start button or press Space to start the game.
- Pause: Click Pause or press Space to toggle pause.
- Reset: Click Reset to clear the board and reset score/time.
- Move: Arrow keys or WASD. On touch devices, swipe in the direction you want the snake to go.

## How the responsive board works

- The visual grid is created using a CSS background made from two linear-gradients. The grid cell size is controlled via a CSS variable `--cell-size` (20/24/28px by media queries).
- The canvas is created inside `.grid` and its pixel size is computed at runtime based on the number of columns and rows that fit the grid container at the current `--cell-size`.
- The canvas is scaled using `devicePixelRatio` for crisp rendering on HiDPI displays.

The result is a board that displays a consistent number of square cells across different devices and resizes when the browser window changes.

## Scoring and Time

- Score increments by 1 whenever the snake eats a food piece.
- High score is stored in `localStorage` under the key `snake_high` and displayed in the left header pill.
- The timer shows elapsed time (MM:SS) since the current game start.






## Customization and tuning

- Change speed: edit `cfg.tickMs` in `script.js`.
- Change starting length: edit `cfg.initialLength`.
- Change grid cell sizes: edit the `--cell-size` values in `style.css` media queries.
- Toggle wrapping behavior or collision rules in `tick()` (currently hitting walls ends the game).

## Next steps and ideas

- Replace block-drawing with sprite-based rendering (use images for snake head/body and food).
- Add levels and speed scaling when the score increases.
- Add sound effects for eating / game over.
- Add a settings panel for player to change cell size, speed, or theme.
- Implement a virtual joystick for mobile controls.

## Issues & contribution

If you find issues or want to contribute enhancements, feel free to:

- Open an issue describing the bug or feature request.
- Create a pull request with a small, focused change.

---

- Made with ❤️ for learning and fun!
