/** Match-3 inventory trays */

export class Inventory {
  constructor(trayCount = 2) {
    this.capacity = 3;
    this.trays = Array.from({ length: trayCount }, () => ({
      color: null,
      screws: [],
    }));
  }

  setTrayCount(n) {
    while (this.trays.length < n) {
      this.trays.push({ color: null, screws: [] });
    }
    this.trays = this.trays.slice(0, n);
  }

  /** Index of tray that would accept this color, or -1 */
  findTrayFor(color) {
    let idx = this.trays.findIndex(
      (t) => t.color === color && t.screws.length < this.capacity
    );
    if (idx === -1) {
      idx = this.trays.findIndex((t) => t.screws.length === 0);
    }
    return idx;
  }

  canPlace(color) {
    return this.findTrayFor(color) !== -1;
  }

  /** Place a screw color. Returns { ok, clearedTrayIndex? } or { ok:false, reason } */
  tryPlace(color) {
    const idx = this.findTrayFor(color);
    if (idx === -1) {
      return { ok: false, reason: "full" };
    }

    const tray = this.trays[idx];
    tray.color = color;
    tray.screws.push(color);

    if (tray.screws.length >= this.capacity) {
      tray.screws = [];
      tray.color = null;
      return { ok: true, clearedTrayIndex: idx };
    }
    return { ok: true, clearedTrayIndex: null };
  }

  isStuck(remainingColors) {
    // Inventory full and no remaining screw can fit any tray
    const hasEmpty = this.trays.some((t) => t.screws.length === 0);
    if (hasEmpty) return false;
    const openColors = new Set(
      this.trays
        .filter((t) => t.screws.length > 0 && t.screws.length < this.capacity)
        .map((t) => t.color)
    );
    return !remainingColors.some((c) => openColors.has(c));
  }

  snapshot() {
    return this.trays.map((t) => ({
      color: t.color,
      count: t.screws.length,
      slots: [...t.screws],
    }));
  }

  reset() {
    this.trays.forEach((t) => {
      t.color = null;
      t.screws = [];
    });
  }
}
