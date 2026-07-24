/**
 * Per-level visual themes — different character, vessel, and palette.
 */

export const THEMES = {
  parfait: {
    id: "parfait",
    label: "Green Bear Parfait",
    character: "bear",
    fur: 0x8fdc4a,
    belly: 0xb8f070,
    vessel: "glass",
    vesselTint: 0xc8e8ff,
    scoop: 0xfff8f0,
    bgAccent: 0x4a6fd4,
  },
  cupcake: {
    id: "cupcake",
    label: "Pink Bunny Cupcake",
    character: "bunny",
    fur: 0xff9ec8,
    belly: 0xffd0e4,
    vessel: "cup",
    vesselTint: 0xffd0e8,
    scoop: 0xffe8f4,
    bgAccent: 0xd46aa8,
  },
  penguin: {
    id: "penguin",
    label: "Blue Penguin Cone",
    character: "penguin",
    fur: 0x4da3ff,
    belly: 0xffffff,
    vessel: "cone",
    vesselTint: 0xe8c49a,
    scoop: 0xd0ecff,
    bgAccent: 0x3a7fd4,
  },
  cat: {
    id: "cat",
    label: "Purple Cat Sundae",
    character: "cat",
    fur: 0xb57bff,
    belly: 0xe8d0ff,
    vessel: "glass",
    vesselTint: 0xe0d0ff,
    scoop: 0xf5e8ff,
    bgAccent: 0x7a4fd4,
  },
  fox: {
    id: "fox",
    label: "Orange Fox Shake",
    character: "fox",
    fur: 0xff9a4d,
    belly: 0xffe0c0,
    vessel: "shake",
    vesselTint: 0xffe8d0,
    scoop: 0xfff0e0,
    bgAccent: 0xd47a3a,
  },
  chick: {
    id: "chick",
    label: "Sunny Chick Bowl",
    character: "chick",
    fur: 0xffd84d,
    belly: 0xfff6c8,
    vessel: "bowl",
    vesselTint: 0xfff0b0,
    scoop: 0xfff8d8,
    bgAccent: 0xd4a82a,
  },
  unicorn: {
    id: "unicorn",
    label: "Rainbow Unicorn",
    character: "unicorn",
    fur: 0xffffff,
    belly: 0xffe0f0,
    vessel: "glass",
    vesselTint: 0xffe0f8,
    scoop: 0xffffff,
    bgAccent: 0x9a6fd4,
    rainbow: true,
  },
};

export function themeForLevel(levelId) {
  const order = [
    "parfait",
    "cupcake",
    "penguin",
    "cat",
    "fox",
    "chick",
    "unicorn",
  ];
  return THEMES[order[(levelId - 1) % order.length]] || THEMES.parfait;
}
