import * as THREE from "three";

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.55,
    metalness: opts.metalness ?? 0.05,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  });
}

/** Procedural cute green bear + confetti parfait in a glass */
export function createDessertGroup() {
  const root = new THREE.Group();
  root.name = "dessert";

  // --- Glass bowl ---
  const glassMat = mat(0xc8e8ff, {
    transparent: true,
    opacity: 0.28,
    roughness: 0.15,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.62),
    glassMat
  );
  bowl.position.y = 0.15;
  bowl.scale.set(1.05, 0.95, 1.05);
  root.add(bowl);

  // Glass stem + base
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.1, 16),
    mat(0xd8f0ff, { transparent: true, opacity: 0.35, roughness: 0.1 })
  );
  stem.position.y = -1.05;
  root.add(stem);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 0.12, 24),
    mat(0xd8f0ff, { transparent: true, opacity: 0.4, roughness: 0.1 })
  );
  base.position.y = -1.6;
  root.add(base);

  // Rim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.05, 12, 48),
    mat(0xe8f6ff, { transparent: true, opacity: 0.5, roughness: 0.1 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.05;
  root.add(rim);

  // --- Green bear ---
  const bear = new THREE.Group();
  bear.position.set(0, 0.15, 0.05);
  root.add(bear);

  const fur = mat(0x8fdc4a, { roughness: 0.75 });
  const belly = mat(0xb8f070, { roughness: 0.8 });
  const dark = mat(0x3a3a50);
  const noseMat = mat(0xff8a4a);
  const cheekMat = mat(0xff8ab8, { roughness: 0.7 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 24), fur);
  body.scale.set(1.05, 0.95, 0.9);
  bear.add(body);

  const tummy = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 18), belly);
  tummy.position.set(0, -0.15, 0.55);
  tummy.scale.set(1, 0.9, 0.55);
  bear.add(tummy);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 24), fur);
  head.position.set(0, 0.85, 0.35);
  bear.add(head);

  // Ears
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), fur);
    ear.position.set(sx * 0.55, 1.35, 0.2);
    bear.add(ear);
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 10),
      mat(0xffb0d0)
    );
    inner.position.set(sx * 0.55, 1.35, 0.35);
    bear.add(inner);
  }

  // Snout
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), belly);
  snout.position.set(0, 0.7, 0.9);
  snout.scale.set(1.1, 0.85, 0.7);
  bear.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), noseMat);
  nose.position.set(0, 0.78, 1.1);
  bear.add(nose);

  // Eyes
  for (const sx of [-1, 1]) {
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 10),
      mat(0xffffff)
    );
    eyeWhite.position.set(sx * 0.22, 0.95, 0.95);
    bear.add(eyeWhite);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), dark);
    pupil.position.set(sx * 0.22, 0.95, 1.05);
    bear.add(pupil);
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 10, 8),
      cheekMat
    );
    cheek.position.set(sx * 0.42, 0.72, 0.88);
    cheek.scale.set(1, 0.7, 0.5);
    bear.add(cheek);
  }

  // Smile
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI),
    dark
  );
  smile.position.set(0, 0.62, 1.05);
  smile.rotation.x = Math.PI;
  smile.rotation.z = Math.PI;
  bear.add(smile);

  // Arms
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), fur);
    arm.position.set(sx * 0.95, 0.15, 0.35);
    arm.scale.set(0.7, 1.1, 0.7);
    bear.add(arm);
  }

  // --- Confetti ice cream scoops ---
  const confettiTex = makeConfettiTexture();
  const scoopMat = new THREE.MeshStandardMaterial({
    map: confettiTex,
    roughness: 0.65,
    metalness: 0.05,
  });

  const scoop1 = new THREE.Mesh(new THREE.SphereGeometry(0.72, 28, 20), scoopMat);
  scoop1.position.set(-0.15, 1.55, -0.15);
  root.add(scoop1);

  const scoop2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 18), scoopMat);
  scoop2.position.set(0.55, 1.35, 0.1);
  root.add(scoop2);

  // Candy sticks (straws)
  for (let i = 0; i < 2; i++) {
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.4, 10),
      new THREE.MeshStandardMaterial({
        map: confettiTex,
        roughness: 0.5,
      })
    );
    stick.position.set(-0.25 + i * 0.25, 2.25, -0.2);
    stick.rotation.z = (i === 0 ? -1 : 1) * 0.12;
    stick.rotation.x = 0.15;
    root.add(stick);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 8),
      mat(i === 0 ? 0xb57bff : 0x4da3ff)
    );
    tip.position.copy(stick.position);
    tip.position.y += 0.72;
    root.add(tip);
  }

  // Floating candy beads on scoops
  const beads = [0xff6bb5, 0x4da3ff, 0xffd84d, 0xb57bff, 0x7dcf4a, 0xff9a4d];
  for (let i = 0; i < 14; i++) {
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.04, 10, 8),
      mat(beads[i % beads.length])
    );
    const a = (i / 14) * Math.PI * 2;
    bead.position.set(
      Math.cos(a) * 0.55 + (Math.random() - 0.5) * 0.2,
      1.7 + Math.random() * 0.45,
      Math.sin(a) * 0.4 - 0.1
    );
    root.add(bead);
  }

  // Soft ground shadow disc
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 32),
    new THREE.MeshBasicMaterial({
      color: 0x1a2a60,
      transparent: true,
      opacity: 0.18,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.66;
  root.add(shadow);

  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}

function makeConfettiTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff8f0";
  ctx.fillRect(0, 0, size, size);
  const dots = ["#ff6bb5", "#4da3ff", "#7dcf4a", "#ffd84d", "#b57bff", "#ff9a4d"];
  for (let i = 0; i < 80; i++) {
    ctx.beginPath();
    ctx.fillStyle = dots[i % dots.length];
    const r = 3 + Math.random() * 7;
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}
