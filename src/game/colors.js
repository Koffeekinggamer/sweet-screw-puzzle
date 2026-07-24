/** Shared color palette for screws / tools / UI */

export const COLORS = {
  pink: { id: "pink", hex: 0xff6bb5, css: "#ff6bb5", label: "Pink" },
  blue: { id: "blue", hex: 0x4da3ff, css: "#4da3ff", label: "Blue" },
  green: { id: "green", hex: 0x7dcf4a, css: "#7dcf4a", label: "Green" },
  yellow: { id: "yellow", hex: 0xffd84d, css: "#ffd84d", label: "Yellow" },
  purple: { id: "purple", hex: 0xb57bff, css: "#b57bff", label: "Purple" },
  orange: { id: "orange", hex: 0xff9a4d, css: "#ff9a4d", label: "Orange" },
  cyan: { id: "cyan", hex: 0x4de0d2, css: "#4de0d2", label: "Cyan" },
  white: { id: "white", hex: 0xf5f7ff, css: "#f5f7ff", label: "White" },
};

export function colorOf(id) {
  return COLORS[id] || COLORS.blue;
}
