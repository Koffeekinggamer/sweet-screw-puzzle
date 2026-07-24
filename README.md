# Sweet Screw Puzzle

A cute browser-based **3D screw puzzle** inspired by kids’ ASMR screwdriver games — free the green bear from the confetti parfait by unscrewing every bolt!

## Play

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Build for production:

```bash
npm run build
npm run preview
```

## How to play

1. **Pick a tool** on the right (color screwdriver, wrench, or drill).
2. **Tap screws** that match that tool.
3. Screws go into **trays** on the left — fill **3 of the same color** to clear a tray.
4. If trays fill with no moves left, you lose — plan your colors!
5. Drag to **spin** the dessert and find hidden screws.
6. Clear all screws to free the bear and unlock the next level.

## Features

- 7 handcrafted levels with rising difficulty  
- Procedural 3D bear + parfait (Three.js)  
- Color tools + wrench / drill specials  
- Match-3 inventory trays with unlock progression  
- Progress saved in `localStorage`  
- Touch-friendly UI for tablets  

## Stack

- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/)
- Vanilla JS + CSS

## License

MIT
