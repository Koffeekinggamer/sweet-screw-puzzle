import * as THREE from "three";
import { createDessertGroup } from "./bearModel.js";
import { placeScrews, animateScrewOut } from "./screws.js";

export class Scene3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.screws = [];
    this.rotating = false;
    this.lastX = 0;
    this.lastY = 0;
    this.autoSpin = 0.15;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragMoved = false;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0.6, 6.2);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(4, 8, 5);
    key.castShadow = true;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8c8ff, 0.45);
    fill.position.set(-5, 2, -3);
    this.scene.add(fill);
    const rim = new THREE.PointLight(0xffd0f0, 0.55, 20);
    rim.position.set(0, 2, 3);
    this.scene.add(rim);

    this.stage = new THREE.Group();
    this.scene.add(this.stage);

    this.dessert = createDessertGroup();
    this.stage.add(this.dessert);

    this.screwRoot = new THREE.Group();
    this.stage.add(this.screwRoot);

    this._bindInput();
    window.addEventListener("resize", () => this.onResize());

    this._running = true;
    this._loop();
  }

  loadScrews(screwDefs) {
    // Clear old
    while (this.screwRoot.children.length) {
      this.screwRoot.remove(this.screwRoot.children[0]);
    }
    this.screws = placeScrews(this.screwRoot, screwDefs);
    this.stage.rotation.set(0.12, 0.4, 0);
    return this.screws;
  }

  getRemaining() {
    return this.screws.filter((s) => !s.removed);
  }

  pickScrew(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const meshes = this.getRemaining().flatMap((s) => {
      const list = [];
      s.mesh.traverse((o) => {
        if (o.isMesh) list.push(o);
      });
      return list;
    });
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj && !obj.userData?.isScrew) obj = obj.parent;
    if (!obj) return null;
    return this.screws.find((s) => s.mesh === obj && !s.removed) || null;
  }

  async removeScrew(screw) {
    if (!screw || screw.removed) return;
    screw.removed = true;
    await animateScrewOut(screw.mesh);
    this.screwRoot.remove(screw.mesh);
  }

  highlightColor(colorId) {
    for (const s of this.screws) {
      if (s.removed) continue;
      const match = s.color === colorId;
      s.mesh.scale.setScalar(match ? 1.12 : 0.92);
      s.mesh.traverse((o) => {
        if (o.isMesh && o.material && o.material.emissive) {
          o.material.emissive = new THREE.Color(match ? 0x222222 : 0x000000);
        }
      });
    }
  }

  clearHighlight() {
    for (const s of this.screws) {
      if (s.removed) continue;
      s.mesh.scale.setScalar(1);
      s.mesh.traverse((o) => {
        if (o.isMesh && o.material && o.material.emissive) {
          o.material.emissive = new THREE.Color(0x000000);
        }
      });
    }
  }

  _bindInput() {
    const onDown = (x, y) => {
      this.rotating = true;
      this.dragMoved = false;
      this.lastX = x;
      this.lastY = y;
      this.autoSpin = 0;
    };
    const onMove = (x, y) => {
      if (!this.rotating) return;
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 4) this.dragMoved = true;
      this.stage.rotation.y += dx * 0.008;
      this.stage.rotation.x = Math.max(
        -0.6,
        Math.min(0.7, this.stage.rotation.x + dy * 0.006)
      );
      this.lastX = x;
      this.lastY = y;
    };
    const onUp = () => {
      this.rotating = false;
    };

    this.canvas.addEventListener("pointerdown", (e) => {
      this.canvas.setPointerCapture(e.pointerId);
      onDown(e.clientX, e.clientY);
    });
    this.canvas.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY));
    this.canvas.addEventListener("pointerup", (e) => {
      onUp();
      if (!this.dragMoved && this.onTap) {
        this.onTap(e.clientX, e.clientY);
      }
    });
    this.canvas.addEventListener("pointercancel", onUp);
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _loop() {
    if (!this._running) return;
    if (!this.rotating && this.autoSpin) {
      this.stage.rotation.y += this.autoSpin * 0.01;
    }
    // gentle idle bob
    if (this.dessert) {
      this.dessert.position.y = Math.sin(performance.now() * 0.0015) * 0.04;
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this._loop());
  }

  dispose() {
    this._running = false;
    this.renderer.dispose();
  }
}
