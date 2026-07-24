/**
 * Level definitions — each has a unique theme/design.
 * Tap any screw freely (no tool selection). Match-3 trays.
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
    screws: pack(["pink", "blue"], [6, 6]),
    hint: "Tap any screw! Match 3 of a color in a tray to clear it.",
  },
  {
    id: 2,
    name: "Bunny Cupcake",
    theme: "cupcake",
    trays: 4,
    screws: pack(["pink", "blue", "green"], [8, 8, 6]),
    hint: "New design: pink bunny cupcake. Plan your trays!",
  },
  {
    id: 3,
    name: "Penguin Cone",
    theme: "penguin",
    trays: 4,
    screws: pack(["pink", "blue", "green", "yellow"], [8, 8, 8, 6]),
    hint: "Blue penguin ice cream cone — four trays ready.",
  },
  {
    id: 4,
    name: "Purple Cat",
    theme: "cat",
    trays: 4,
    screws: pack(["pink", "blue", "green", "yellow", "purple"], [10, 10, 8, 8, 6]),
    hint: "Purple cat sundae — more colors to juggle!",
  },
  {
    id: 5,
    name: "Fox Shake",
    theme: "fox",
    trays: 4,
    screws: pack(
      ["pink", "blue", "green", "yellow", "purple", "orange"],
      [8, 8, 8, 8, 6, 6]
    ),
    hint: "Orange fox milkshake — keep trays clearing!",
  },
  {
    id: 6,
    name: "Sunny Chick",
    theme: "chick",
    trays: 4,
    screws: pack(
      ["pink", "blue", "green", "yellow", "purple", "cyan", "orange"],
      [10, 10, 10, 8, 8, 8, 6]
    ),
    hint: "Sunny chick bowl — big scoop challenge!",
  },
  {
    id: 7,
    name: "Rainbow Unicorn",
    theme: "unicorn",
    trays: 4,
    screws: pack(
      ["pink", "blue", "green", "yellow", "purple", "cyan", "orange", "white"],
      [10, 10, 8, 8, 8, 6, 6, 6]
    ),
    hint: "Final design: rainbow unicorn — free them all!",
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}
