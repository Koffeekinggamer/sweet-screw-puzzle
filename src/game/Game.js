import { Scene3D } from "./Scene3D.js";
import { Inventory } from "./inventory.js";
import { ScrewBuffer } from "./buffer.js";
import { getLevel, LEVELS } from "./levels.js";
import { colorOf } from "./colors.js";
import { loadSave, completeLevel, resetSave } from "./save.js";

const TRAY_PALETTE = ["pink", "blue", "green", "yellow"];

export class Game {
  constructor(root) {
    this.root = root;
    this.save = loadSave();
    this.busy = false;
    this.level = null;
    this.inventory = new Inventory(4);
    this.buffer = new ScrewBuffer(5);
    this.removedCount = 0;
    this.totalScrews = 0;
    this.mode = "title";

    this._buildDom();
    this.scene = new Scene3D(this.canvas);
    this.scene.onTap = (x, y) => this._onSceneTap(x, y);

    this.showTitle();
  }

  _buildDom() {
    this.root.innerHTML = `
      <canvas id="game-canvas"></canvas>
      <div id="hud" class="hidden"></div>

      <div id="screen-title" class="screen">
        <div class="logo-title">Sweet Screw Puzzle</div>
        <div class="logo-sub">Unscrew layers · Match trays · Don't fill the holder!</div>
        <button class="btn btn-primary" id="btn-play">Play</button>
        <button class="btn btn-secondary" id="btn-levels">Levels</button>
        <button class="btn btn-ghost" id="btn-reset" style="margin-top:20px">Reset Progress</button>
      </div>

      <div id="screen-levels" class="screen hidden">
        <div class="logo-title" style="font-size:2rem">Levels</div>
        <div class="level-grid" id="level-grid"></div>
        <button class="btn btn-secondary" id="btn-back-title">Back</button>
      </div>

      <div id="modal" class="modal-backdrop hidden">
        <div class="modal">
          <div class="stars" id="modal-stars">★★★</div>
          <h2 id="modal-title">Level Clear!</h2>
          <p id="modal-body">You freed the cutie.</p>
          <button class="btn btn-primary" id="modal-primary">Continue</button>
          <button class="btn btn-secondary" id="modal-secondary">Levels</button>
        </div>
      </div>
    `;

    this.canvas = this.root.querySelector("#game-canvas");
    this.hud = this.root.querySelector("#hud");
    this.screenTitle = this.root.querySelector("#screen-title");
    this.screenLevels = this.root.querySelector("#screen-levels");
    this.modal = this.root.querySelector("#modal");

    this.root.querySelector("#btn-play").onclick = () => {
      const id = Math.min(this.save.unlockedLevel, LEVELS.length);
      this.startLevel(id);
    };
    this.root.querySelector("#btn-levels").onclick = () => this.showLevels();
    this.root.querySelector("#btn-back-title").onclick = () => this.showTitle();
    this.root.querySelector("#btn-reset").onclick = () => {
      if (confirm("Reset all progress?")) {
        this.save = resetSave();
        this.showTitle();
      }
    };
    this.root.querySelector("#modal-primary").onclick = () => this._modalPrimary();
    this.root.querySelector("#modal-secondary").onclick = () => {
      this.modal.classList.add("hidden");
      this.showLevels();
    };
  }

  showTitle() {
    this.mode = "title";
    this.save = loadSave();
    this.screenTitle.classList.remove("hidden");
    this.screenLevels.classList.add("hidden");
    this.hud.classList.add("hidden");
    this.modal.classList.add("hidden");
  }

  showLevels() {
    this.mode = "levels";
    this.save = loadSave();
    this.screenTitle.classList.add("hidden");
    this.screenLevels.classList.remove("hidden");
    this.hud.classList.add("hidden");
    this.modal.classList.add("hidden");

    const grid = this.root.querySelector("#level-grid");
    grid.innerHTML = LEVELS.map((lv) => {
      const locked = lv.id > this.save.unlockedLevel;
      const done = !!this.save.completed[lv.id];
      return `
        <button class="level-card ${done ? "done" : ""}" data-id="${lv.id}"
          ${locked ? "disabled" : ""}>
          ${locked ? `<span class="lock">🔒</span>` : lv.id}
        </button>`;
    }).join("");

    grid.querySelectorAll(".level-card").forEach((btn) => {
      btn.onclick = () => this.startLevel(Number(btn.dataset.id));
    });
  }

  startLevel(id) {
    this.save = loadSave();
    if (id > this.save.unlockedLevel) return;

    this.level = getLevel(id);
    this.mode = "play";
    this.busy = false;
    this.removedCount = 0;
    this.totalScrews = this.level.screws.length;
    this.inventory = new Inventory(4);
    this.buffer = new ScrewBuffer(5);

    this.screenTitle.classList.add("hidden");
    this.screenLevels.classList.add("hidden");
    this.modal.classList.add("hidden");
    this.hud.classList.remove("hidden");

    this.scene.loadLevel(
      this.level.screws,
      this.level.theme || "parfait",
      this.level.stackOpts || {}
    );
    this._renderHud();
    this._showHint(
      this.level.hint ||
        "Only top-layer screws! Match 3 in trays. Holder holds 5 — fill it and you lose."
    );
  }

  _renderHud() {
    const traysHtml = this.inventory.trays
      .map((t, i) => {
        const accent = t.color
          ? colorOf(t.color)
          : colorOf(TRAY_PALETTE[i % TRAY_PALETTE.length]);
        const label = t.color ? colorOf(t.color).label : "Open";
        const dots = Array.from({ length: 3 }, (_, s) => {
          const filled = s < t.screws.length;
          const col = filled ? colorOf(t.color).css : "transparent";
          return `<div class="slot-dot ${filled ? "filled" : ""}" style="${
            filled
              ? `background:${col};border-color:rgba(0,0,0,0.12)`
              : `border-color:${accent.css}66;background:${accent.css}22`
          }"></div>`;
        }).join("");
        return `
          <div class="tray tray-color" data-tray="${i}"
            style="border-color:${accent.css};background:linear-gradient(180deg,#fff,${accent.css}28)">
            <div class="tray-slots">${dots}</div>
            <div class="tray-label" style="color:${accent.css}">${label}</div>
          </div>`;
      })
      .join("");

    // 5-slot overflow holder
    const bufSlots = Array.from({ length: this.buffer.capacity }, (_, i) => {
      const c = this.buffer.slots[i];
      if (c) {
        const css = colorOf(c).css;
        return `<div class="buffer-slot filled" style="background:${css}"></div>`;
      }
      return `<div class="buffer-slot"></div>`;
    }).join("");

    const bufFull = this.buffer.isFull ? " buffer-full" : "";

    this.hud.innerHTML = `
      <div class="hud-top">
        <div style="display:flex;gap:10px;align-items:center">
          <button class="icon-btn" id="btn-pause" title="Pause">⏸</button>
          <div class="pill">Level ${this.level.id}</div>
        </div>
        <div class="pill" id="level-name">${this.level.name}</div>
      </div>

      <div class="inventory-rail">
        ${traysHtml}
      </div>

      <div class="buffer-panel${bufFull}">
        <div class="buffer-title">Holder ${this.buffer.count}/${this.buffer.capacity}</div>
        <div class="buffer-slots">${bufSlots}</div>
        <div class="buffer-warn">Fills up = lose!</div>
      </div>

      <div class="rotate-hint">Drag to spin · Only top-layer screws</div>

      <div class="screw-counter">
        <div class="mini-screw"></div>
        <span id="counter-text">${this.removedCount}/${this.totalScrews}</span>
      </div>

      <div class="hint" id="hint"></div>
    `;

    this.hud.querySelector("#btn-pause").onclick = () => this._pause();
    if (this._lastHint) this._showHint(this._lastHint, true);
  }

  _showHint(text, keep = false) {
    this._lastHint = text;
    const el = this.hud.querySelector("#hint");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(this._hintTimer);
    if (!keep) {
      this._hintTimer = setTimeout(() => el.classList.remove("show"), 3500);
    }
  }

  /** Move as many buffer screws into trays as possible */
  _flushBufferToTrays() {
    let moved = true;
    let clearedAny = false;
    while (moved) {
      moved = false;
      for (const color of [...new Set(this.buffer.slots)]) {
        if (this.inventory.canPlace(color) && this.buffer.takeColor(color)) {
          const r = this.inventory.tryPlace(color);
          moved = true;
          if (r.clearedTrayIndex != null) clearedAny = true;
        }
      }
    }
    return clearedAny;
  }

  async _onSceneTap(x, y) {
    if (this.mode !== "play" || this.busy) return;
    const screw = this.scene.pickScrew(x, y);
    if (!screw) return;

    if (!screw.accessible) {
      this._showHint("Buried! Remove the screw on top of this stack first.");
      return;
    }

    const canTray = this.inventory.canPlace(screw.color);
    const canBuf = this.buffer.canAdd();

    if (!canTray && !canBuf) {
      this._lose(
        "No room in trays or holder!",
        "Clear matches earlier so trays open up — or avoid filling the 5-slot holder."
      );
      return;
    }

    this.busy = true;
    let wentToBuffer = false;
    let clearedTray = null;

    if (canTray) {
      const preview = this.inventory.tryPlace(screw.color);
      clearedTray = preview.clearedTrayIndex;
    } else {
      // Overflow into 5-slot holder
      const b = this.buffer.tryAdd(screw.color);
      wentToBuffer = true;
      if (!b.ok) {
        this.busy = false;
        this._lose(
          "Holder full!",
          "The extra holder only holds 5 screws. Restart and plan your trays."
        );
        return;
      }
    }

    await this.scene.removeScrew(screw);
    this.removedCount += 1;

    // After tray clear, pull from buffer
    if (clearedTray != null) {
      this._flushBufferToTrays();
      this._showHint("Match! Tray cleared ✨");
    } else if (wentToBuffer) {
      this._showHint(
        `In holder (${this.buffer.count}/5) — match trays to free space!`
      );
    }

    // Lose immediately if holder filled to 5
    if (this.buffer.isFull) {
      this._renderHud();
      this.busy = false;
      this._lose(
        "Holder full!",
        "You filled all 5 holder slots. Restart the level and clear trays sooner."
      );
      return;
    }

    this._renderHud();
    this.busy = false;

    if (this.scene.getRemaining().length === 0) {
      this._flushBufferToTrays();
      this._renderHud();
      if (this.buffer.count === 0) {
        this._onWin();
        return;
      }
      // Screws off the model but holder leftovers can't enter trays
      const left = [...new Set(this.buffer.slots)];
      if (this.inventory.cannotPlaceAny(left)) {
        this._lose(
          "Holder leftovers!",
          "Screws left in the holder can't make tray matches. Restart and clear trays sooner."
        );
        return;
      }
    }

    this._checkStuckOrLose();
  }

  _checkStuckOrLose() {
    const accessible = this.scene.getAccessible();
    if (accessible.length === 0 && this.scene.getRemaining().length > 0) {
      // Shouldn't happen with stack rules
      return;
    }

    const accessColors = accessible.map((s) => s.color);
    const anyTrayMove = accessColors.some((c) => this.inventory.canPlace(c));
    const anyBufMove = this.buffer.canAdd() && accessible.length > 0;

    // Can still put something in buffer even if trays blocked
    if (!anyTrayMove && !anyBufMove && accessible.length > 0) {
      this._lose(
        "No moves left!",
        "No tray space for the exposed screws, and the holder is full. Restart the level."
      );
      return;
    }

    // Trays can't take any accessible screw AND buffer is full
    if (
      this.inventory.cannotPlaceAny(accessColors) &&
      this.buffer.isFull &&
      accessible.length > 0
    ) {
      this._lose(
        "Stuck!",
        "You can't place any more exposed screws into trays, and the holder is full."
      );
    }
  }

  _lose(title, body) {
    this._showModal({
      stars: "💀",
      title,
      body,
      primary: "Retry Level",
      secondary: "Levels",
      onPrimary: () => this.startLevel(this.level.id),
      onSecondary: () => this.showLevels(),
    });
  }

  _onWin() {
    // Must clear buffer too
    this._flushBufferToTrays();
    if (this.buffer.count > 0 || this.scene.getRemaining().length > 0) {
      this._checkStuckOrLose();
      return;
    }

    const empty =
      this.inventory.trays.filter((t) => t.screws.length === 0).length >=
      this.inventory.trays.length;
    const stars = empty ? 3 : 2;
    this.save = completeLevel(this.level.id, stars);
    const next = this.level.id + 1;
    const hasNext = next <= LEVELS.length && next <= this.save.unlockedLevel;

    this._showModal({
      stars: "★".repeat(stars) + "☆".repeat(3 - stars),
      title: "Level Clear!",
      body: `You cleared Level ${this.level.id}: ${this.level.name}. ${
        hasNext ? "Next level unlocked!" : "Great job!"
      }`,
      primary: hasNext ? "Next Level" : "Levels",
      secondary: "Replay",
      onPrimary: () => {
        if (hasNext) this.startLevel(next);
        else this.showLevels();
      },
      onSecondary: () => this.startLevel(this.level.id),
    });
  }

  _pause() {
    this._showModal({
      stars: "⏸",
      title: "Paused",
      body: `Level ${this.level.id} — ${this.removedCount}/${this.totalScrews} · Holder ${this.buffer.count}/5`,
      primary: "Resume",
      secondary: "Quit to Levels",
      onPrimary: () => {
        this.modal.classList.add("hidden");
      },
      onSecondary: () => this.showLevels(),
    });
  }

  _showModal({ stars, title, body, primary, secondary, onPrimary, onSecondary }) {
    this._modalOnPrimary = onPrimary;
    this._modalOnSecondary = onSecondary;
    this.root.querySelector("#modal-stars").textContent = stars;
    this.root.querySelector("#modal-title").textContent = title;
    this.root.querySelector("#modal-body").textContent = body;
    this.root.querySelector("#modal-primary").textContent = primary;
    this.root.querySelector("#modal-secondary").textContent = secondary;
    this.root.querySelector("#modal-secondary").onclick = () => {
      this.modal.classList.add("hidden");
      if (this._modalOnSecondary) this._modalOnSecondary();
    };
    this.modal.classList.remove("hidden");
  }

  _modalPrimary() {
    this.modal.classList.add("hidden");
    if (this._modalOnPrimary) this._modalOnPrimary();
  }
}
