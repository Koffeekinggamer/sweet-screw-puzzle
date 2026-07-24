/**
 * Levels with unique themes + stack depth (layering difficulty).
 * Only top-of-stack screws are removable.
 * Match-3 trays + 5-slot overflow holder (full holder = lose).
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
    theme: "parfait",
    trays: 4,
    stackOpts: { stackCount: 6, maxDepth: 2 },
    screws: pack(["pink", "blue"], [6, 6]),
    hint: "Only bright top screws! Buried ones wait. Match 3 · holder holds 5.",
  },
  {
    id: 2,
    name: "Bunny Cupcake",
    theme: "cupcake",
    trays: 4,
    stackOpts: { stackCount: 7, maxDepth: 3 },
    screws: pack(["pink", "blue", "green"], [8, 8, 6]),
    hint: "Deeper stacks — clear the top layer to reach more colors.",
  },
  {
    id: 3,
    name: "Penguin Cone",
    theme: "penguin",
    trays: 4,
    stackOpts: { stackCount: 8, maxDepth: 3 },
    screws: pack(["pink", "blue", "green", "yellow"], [8, 8, 8, 6]),
    hint: "Don't dump into the holder too fast — 5 max or you lose!",
  },
  {
    id: 4,
    name: "Purple Cat",
    theme: "cat",
    trays: 4,
    stackOpts: { stackCount: 9, maxDepth: 3 },
    screws: pack(["pink", "blue", "green", "yellow", "purple"], [10, 10, 8, 8, 6]),
    hint: "Plan colors so trays clear before the holder fills.",
  },
  {
    id: 5,
    name: "Fox Shake",
    theme: "fox",
    trays: 4,
    stackOpts: { stackCount: 10, maxDepth: 4 },
    screws: pack(
      ["pink", "blue", "green", "yellow", "purple", "orange"],
      [8, 8, 8, 8, 6, 6]
    ),
    hint: "Four-deep stacks! Only the outer screw of each stack is free.",
  },
  {
    id: 6,
    name: "Sunny Chick",
    theme: "chick",
    trays: 4,
    stackOpts: { stackCount: 11, maxDepth: 4 },
    screws: pack(
      ["pink", "blue", "green", "yellow", "purple", "cyan", "orange"],
      [10, 10, 10, 8, 8, 8, 6]
    ),
    hint: "Big board — keep matching so the holder stays empty.",
  },
  {
    id: 7,
    name: "Rainbow Unicorn",
    theme: "unicorn",
    trays: 4,
    stackOpts: { stackCount: 12, maxDepth: 4 },
    screws: pack(
      ["pink", "blue", "green", "yellow", "purple", "cyan", "orange", "white"],
      [10, 10, 8, 8, 8, 6, 6, 6]
    ),
    hint: "Final challenge: layers + colors. Holder full = restart!",
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}
