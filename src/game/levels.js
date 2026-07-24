/**
 * Level definitions for Sweet Screw Puzzle.
 * Each screw is { color, tool? } — tool defaults to screwdriver-{color}.
 * Positions are generated on a sphere/shell around the dessert model.
 */

function pack(colors, counts) {
  const list = [];
  colors.forEach((c, i) => {
    const n = counts[i] ?? counts[counts.length - 1];
    for (let k = 0; k < n; k++) list.push({ color: c });
  });
  return list;
}

export const LEVELS = [
  {
    id: 1,
    name: "First Scoop",
    tools: ["screwdriver-pink", "screwdriver-blue"],
    trays: 2,
    screws: pack(["pink", "blue"], [6, 6]),
    hint: "Pick a tool color, then tap matching screws!",
  },
  {
    id: 2,
    name: "Berry Blast",
    tools: ["screwdriver-pink", "screwdriver-blue", "screwdriver-green"],
    trays: 2,
    screws: pack(["pink", "blue", "green"], [8, 8, 6]),
    hint: "Fill a tray with 3 same-color screws to clear it.",
  },
  {
    id: 3,
    name: "Sunny Parfait",
    tools: [
      "screwdriver-pink",
      "screwdriver-blue",
      "screwdriver-green",
      "screwdriver-yellow",
    ],
    trays: 3,
    screws: pack(["pink", "blue", "green", "yellow"], [8, 8, 8, 6]),
    hint: "A third tray is unlocked — plan your colors!",
  },
  {
    id: 4,
    name: "Bear Scoop",
    tools: [
      "screwdriver-pink",
      "screwdriver-blue",
      "screwdriver-green",
      "screwdriver-yellow",
      "wrench",
    ],
    trays: 3,
    screws: [
      ...pack(["pink", "blue", "green", "yellow", "purple"], [10, 10, 8, 8, 6]),
      ...Array.from({ length: 6 }, () => ({ color: "orange", tool: "wrench" })),
    ],
    hint: "Orange bolts need the wrench!",
  },
  {
    id: 5,
    name: "Confetti Glass",
    tools: [
      "screwdriver-pink",
      "screwdriver-blue",
      "screwdriver-green",
      "screwdriver-yellow",
      "wrench",
      "drill",
    ],
    trays: 4,
    screws: [
      ...pack(["pink", "blue", "green", "yellow", "purple", "cyan"], [8, 8, 8, 8, 6, 6]),
      ...Array.from({ length: 5 }, () => ({ color: "orange", tool: "wrench" })),
      ...Array.from({ length: 5 }, () => ({ color: "white", tool: "drill" })),
    ],
    hint: "White screws need the drill. Four trays ready!",
  },
  {
    id: 6,
    name: "Mega Sundae",
    tools: [
      "screwdriver-pink",
      "screwdriver-blue",
      "screwdriver-green",
      "screwdriver-yellow",
      "wrench",
      "drill",
    ],
    trays: 4,
    screws: [
      ...pack(
        ["pink", "blue", "green", "yellow", "purple", "cyan", "orange"],
        [10, 10, 10, 8, 8, 8, 6]
      ),
      ...Array.from({ length: 6 }, () => ({ color: "orange", tool: "wrench" })),
      ...Array.from({ length: 6 }, () => ({ color: "white", tool: "drill" })),
    ],
    hint: "Lots of screws — keep trays moving!",
  },
  {
    id: 7,
    name: "Champion Scoop",
    tools: [
      "screwdriver-pink",
      "screwdriver-blue",
      "screwdriver-green",
      "screwdriver-yellow",
      "wrench",
      "drill",
    ],
    trays: 4,
    screws: [
      ...pack(
        ["pink", "blue", "green", "yellow", "purple", "cyan", "orange"],
        [12, 12, 10, 10, 8, 8, 6]
      ),
      ...Array.from({ length: 8 }, () => ({ color: "orange", tool: "wrench" })),
      ...Array.from({ length: 8 }, () => ({ color: "white", tool: "drill" })),
    ],
    hint: "Final challenge — free the bear!",
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}
