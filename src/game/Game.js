import { Scene3D } from "./Scene3D.js";
import { Inventory } from "./inventory.js";
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
        <div class="logo-sub">Unscrew the treat · Free the cutie!</div>
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
    // Always 4 unlocked trays
    this.inventory = new Inventory(4);

    this.screenTitle.classList.add("hidden");
    this.screenLevels.classList.add("hidden");
    this.modal.classList.add("hidden");
    this.hud.classList.remove("hidden");

    this.scene.loadLevel(this.level.screws, this.level.theme || "parfait");
    this._renderHud();
    this._showHint(this.level.hint || "Tap any screw!");
  }

  _renderHud() {
    // 4 unlocked, color-coded trays
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

      <div class="rotate-hint">Drag to spin · Tap any screw</div>

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
      this._hintTimer = setTimeout(() => el.classList.remove("show"), 3200);
    }
  }

  async _onSceneTap(x, y) {
    if (this.mode !== "play" || this.busy) return;
    const screw = this.scene.pickScrew(x, y);
    if (!screw) return;

    // No tool selection — tap any screw
    if (!this.inventory.canPlace(screw.color)) {
      this._showHint("Trays full! Match 3 of a color to clear space.");
      this._openFailIfStuck();
      return;
    }

    this.busy = true;
    const preview = this.inventory.tryPlace(screw.color);
    await this.scene.removeScrew(screw);
    this.removedCount += 1;

    if (preview.clearedTrayIndex != null) {
      this._showHint("Match! Tray cleared ✨");
      this._popTray(preview.clearedTrayIndex);
    }

    this._renderHud();
    this.busy = false;

    if (this.removedCount >= this.totalScrews) {
      this._onWin();
      return;
    }

    this._openFailIfStuck();
  }

  _popTray(index) {
    requestAnimationFrame(() => {
      const el = this.hud.querySelector(`[data-tray="${index}"]`);
      if (el) el.classList.add("pop");
    });
  }

  _openFailIfStuck() {
    const remaining = this.scene.getRemaining().map((s) => s.color);
    if (this.inventory.isStuck(remaining)) {
      this._showModal({
        stars: "💀",
        title: "Trays Stuck!",
        body: "No more moves — trays are full. Try again and clear matches sooner.",
        primary: "Retry",
        secondary: "Levels",
        onPrimary: () => this.startLevel(this.level.id),
      });
    }
  }

  _onWin() {
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
      body: `Level ${this.level.id} — ${this.removedCount}/${this.totalScrews} screws`,
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
