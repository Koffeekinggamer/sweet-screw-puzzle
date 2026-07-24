/** Temporary overflow holder — capacity 5. Filling it loses the level. */

export class ScrewBuffer {
  constructor(capacity = 5) {
    this.capacity = capacity;
    this.slots = []; // colors
  }

  get count() {
    return this.slots.length;
  }

  get isFull() {
    return this.slots.length >= this.capacity;
  }

  canAdd() {
    return this.slots.length < this.capacity;
  }

  /** @returns {{ ok: boolean, filled?: boolean, reason?: string }} */
  tryAdd(color) {
    if (this.slots.length >= this.capacity) {
      return { ok: false, reason: "full" };
    }
    this.slots.push(color);
    return {
      ok: true,
      filled: this.slots.length >= this.capacity,
    };
  }

  /** Remove first screw matching color (for auto-flush to trays) */
  takeColor(color) {
    const i = this.slots.indexOf(color);
    if (i === -1) return false;
    this.slots.splice(i, 1);
    return true;
  }

  /** Peek colors for UI */
  snapshot() {
    return [...this.slots];
  }

  reset() {
    this.slots = [];
  }
}
