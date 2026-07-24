const KEY = "sweet-screw-puzzle-v1";

const DEFAULT = {
  unlockedLevel: 1,
  completed: {},
  toolsUnlocked: ["screwdriver-pink", "screwdriver-blue"],
  traysUnlocked: 2,
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT, completed: {} };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT, completed: {} };
  }
}

export function writeSave(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function completeLevel(levelId, stars = 1) {
  const s = loadSave();
  const prev = s.completed[levelId] || 0;
  s.completed[levelId] = Math.max(prev, stars);
  s.unlockedLevel = Math.max(s.unlockedLevel, levelId + 1);

  // Unlock tools / trays as player progresses
  if (levelId >= 2 && !s.toolsUnlocked.includes("screwdriver-green")) {
    s.toolsUnlocked.push("screwdriver-green");
  }
  if (levelId >= 3 && !s.toolsUnlocked.includes("screwdriver-yellow")) {
    s.toolsUnlocked.push("screwdriver-yellow");
  }
  if (levelId >= 4 && !s.toolsUnlocked.includes("wrench")) {
    s.toolsUnlocked.push("wrench");
  }
  if (levelId >= 5 && !s.toolsUnlocked.includes("drill")) {
    s.toolsUnlocked.push("drill");
  }
  if (levelId >= 3) s.traysUnlocked = Math.max(s.traysUnlocked, 3);
  if (levelId >= 5) s.traysUnlocked = Math.max(s.traysUnlocked, 4);

  writeSave(s);
  return s;
}

export function resetSave() {
  writeSave({ ...DEFAULT, completed: {} });
  return loadSave();
}
