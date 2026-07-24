import * as THREE from "three";
import { THEMES } from "./themes.js";

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

function makeConfettiTexture(base = "#fff8f0", rainbow = false) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const dots = rainbow
    ? ["#ff6bb5", "#4da3ff", "#7dcf4a", "#ffd84d", "#b57bff", "#ff9a4d", "#4de0d2"]
    : ["#ff6bb5", "#4da3ff", "#7dcf4a", "#ffd84d", "#b57bff", "#ff9a4d"];
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

function addFace(group, y, z, scale = 1) {
  const dark = mat(0x3a3a50);
  const cheekMat = mat(0xff8ab8, { roughness: 0.7 });
  const noseMat = mat(0xff8a4a);

  for (const sx of [-1, 1]) {
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 * scale, 12, 10),
      mat(0xffffff)
    );
    eyeWhite.position.set(sx * 0.2 * scale, y + 0.12 * scale, z);
    group.add(eyeWhite);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 * scale, 10, 8),
      dark
    );
    pupil.position.set(sx * 0.2 * scale, y + 0.12 * scale, z + 0.08 * scale);
    group.add(pupil);
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.09 * scale, 10, 8),
      cheekMat
    );
    cheek.position.set(sx * 0.38 * scale, y - 0.08 * scale, z - 0.05 * scale);
    cheek.scale.set(1, 0.7, 0.5);
    group.add(cheek);
  }

  const snout = new THREE.Mesh(
    new THREE.SphereGeometry(0.22 * scale, 16, 12),
    mat(0xfff0e8)
  );
  snout.position.set(0, y - 0.05 * scale, z + 0.05 * scale);
  snout.scale.set(1.1, 0.85, 0.7);
  group.add(snout);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.08 * scale, 12, 10),
    noseMat
  );
  nose.position.set(0, y + 0.02 * scale, z + 0.22 * scale);
  group.add(nose);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.1 * scale, 0.02 * scale, 8, 16, Math.PI),
    dark
  );
  smile.position.set(0, y - 0.12 * scale, z + 0.18 * scale);
  smile.rotation.x = Math.PI;
  smile.rotation.z = Math.PI;
  group.add(smile);
}

function addCharacter(root, theme) {
  const char = new THREE.Group();
  char.position.set(0, 0.2, 0.05);
  root.add(char);

  const fur = mat(theme.fur, { roughness: 0.75 });
  const belly = mat(theme.belly, { roughness: 0.8 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 24), fur);
  body.scale.set(1.05, 0.95, 0.9);
  char.add(body);

  const tummy = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 18), belly);
  tummy.position.set(0, -0.12, 0.52);
  tummy.scale.set(1, 0.9, 0.55);
  char.add(tummy);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 24), fur);
  head.position.set(0, 0.82, 0.32);
  char.add(head);

  // Character-specific ears / features
  if (theme.character === "bunny" || theme.character === "bear") {
    for (const sx of [-1, 1]) {
      if (theme.character === "bunny") {
        const ear = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.12, 0.45, 6, 12),
          fur
        );
        ear.position.set(sx * 0.32, 1.45, 0.15);
        ear.rotation.z = sx * 0.15;
        char.add(ear);
        const inner = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.06, 0.28, 4, 8),
          mat(0xffb0d0)
        );
        inner.position.set(sx * 0.32, 1.45, 0.28);
        inner.rotation.z = sx * 0.15;
        char.add(inner);
      } else {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), fur);
        ear.position.set(sx * 0.52, 1.28, 0.18);
        char.add(ear);
        const inner = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 12, 10),
          mat(0xffb0d0)
        );
        inner.position.set(sx * 0.52, 1.28, 0.32);
        char.add(inner);
      }
    }
  } else if (theme.character === "cat") {
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 4), fur);
      ear.position.set(sx * 0.42, 1.35, 0.2);
      ear.rotation.z = sx * -0.2;
      char.add(ear);
    }
  } else if (theme.character === "fox") {
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.38, 4), fur);
      ear.position.set(sx * 0.4, 1.32, 0.18);
      char.add(ear);
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.12, 4),
        mat(0x3a3a50)
      );
      tip.position.set(sx * 0.4, 1.52, 0.18);
      char.add(tip);
    }
  } else if (theme.character === "chick") {
    for (const sx of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), fur);
      wing.position.set(sx * 0.85, 0.1, 0.2);
      wing.scale.set(0.6, 0.9, 0.5);
      char.add(wing);
    }
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.22, 8),
      mat(0xff9a4d)
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.75, 0.95);
    char.add(beak);
  } else if (theme.character === "penguin") {
    // white belly already; flippers
    for (const sx of [-1, 1]) {
      const flip = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 10),
        mat(0x2a5080)
      );
      flip.position.set(sx * 0.9, 0.1, 0.15);
      flip.scale.set(0.45, 1.0, 0.55);
      char.add(flip);
    }
    // beak
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.2, 8),
      mat(0xff9a4d)
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.78, 0.95);
    char.add(beak);
  } else if (theme.character === "unicorn") {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.55, 10),
      mat(0xffd84d, { metalness: 0.4, roughness: 0.3 })
    );
    horn.position.set(0, 1.5, 0.35);
    char.add(horn);
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), fur);
      ear.position.set(sx * 0.4, 1.25, 0.15);
      char.add(ear);
    }
    // mane beads
    const mane = [0xff6bb5, 0x4da3ff, 0xb57bff, 0xffd84d];
    for (let i = 0; i < 8; i++) {
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 8),
        mat(mane[i % mane.length])
      );
      bead.position.set(-0.35 + (i % 3) * 0.1, 1.15 - i * 0.08, -0.2);
      char.add(bead);
    }
  }

  // Arms
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), fur);
    arm.position.set(sx * 0.9, 0.12, 0.32);
    arm.scale.set(0.7, 1.1, 0.7);
    char.add(arm);
  }

  addFace(char, 0.78, 0.92, 1);
  return char;
}

function addVessel(root, theme) {
  const glassMat = mat(theme.vesselTint, {
    transparent: true,
    opacity: 0.32,
    roughness: 0.15,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });

  if (theme.vessel === "cone") {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.0, 2.0, 24, 1, true),
      mat(theme.vesselTint, { roughness: 0.7 })
    );
    cone.position.y = -0.5;
    cone.rotation.x = Math.PI;
    root.add(cone);
    return;
  }

  if (theme.vessel === "cup") {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 0.85, 1.5, 28, 1, true),
      glassMat
    );
    cup.position.y = 0.1;
    root.add(cup);
    const bottom = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 28),
      mat(theme.vesselTint, { transparent: true, opacity: 0.4 })
    );
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -0.65;
    root.add(bottom);
    return;
  }

  if (theme.vessel === "shake") {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.75, 2.0, 28, 1, true),
      glassMat
    );
    cup.position.y = 0.0;
    root.add(cup);
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45),
      mat(theme.vesselTint, { transparent: true, opacity: 0.35 })
    );
    lid.position.y = 0.95;
    root.add(lid);
    const straw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.6, 10),
      mat(0xff6bb5)
    );
    straw.position.set(0.25, 1.6, 0);
    straw.rotation.z = -0.2;
    root.add(straw);
    return;
  }

  if (theme.vessel === "bowl") {
    const bowl = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
      glassMat
    );
    bowl.position.y = 0.2;
    bowl.scale.set(1.1, 0.7, 1.1);
    root.add(bowl);
    return;
  }

  // default glass
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.62),
    glassMat
  );
  bowl.position.y = 0.15;
  bowl.scale.set(1.05, 0.95, 1.05);
  root.add(bowl);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.1, 16),
    mat(theme.vesselTint, { transparent: true, opacity: 0.35, roughness: 0.1 })
  );
  stem.position.y = -1.05;
  root.add(stem);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 0.12, 24),
    mat(theme.vesselTint, { transparent: true, opacity: 0.4, roughness: 0.1 })
  );
  base.position.y = -1.6;
  root.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.05, 12, 48),
    mat(0xe8f6ff, { transparent: true, opacity: 0.5, roughness: 0.1 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.05;
  root.add(rim);
}

/** Procedural dessert themed by level */
export function createDessertGroup(themeId = "parfait") {
  const theme = THEMES[themeId] || THEMES.parfait;
  const root = new THREE.Group();
  root.name = "dessert";
  root.userData.themeId = theme.id;

  addVessel(root, theme);
  addCharacter(root, theme);

  const confettiTex = makeConfettiTexture(
    theme.rainbow ? "#fff8ff" : "#fff8f0",
    !!theme.rainbow
  );
  const scoopMat = new THREE.MeshStandardMaterial({
    map: confettiTex,
    roughness: 0.65,
    metalness: 0.05,
    color: theme.scoop,
  });

  const scoop1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 28, 20), scoopMat);
  scoop1.position.set(-0.15, 1.55, -0.15);
  root.add(scoop1);

  const scoop2 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 18), scoopMat);
  scoop2.position.set(0.55, 1.35, 0.1);
  root.add(scoop2);

  if (theme.rainbow) {
    const scoop3 = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 20, 16),
      scoopMat
    );
    scoop3.position.set(0.1, 2.0, -0.1);
    root.add(scoop3);
  }

  // Candy sticks
  for (let i = 0; i < 2; i++) {
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.35, 10),
      new THREE.MeshStandardMaterial({ map: confettiTex, roughness: 0.5 })
    );
    stick.position.set(-0.25 + i * 0.25, 2.2, -0.2);
    stick.rotation.z = (i === 0 ? -1 : 1) * 0.12;
    stick.rotation.x = 0.15;
    root.add(stick);
  }

  const beads = [0xff6bb5, 0x4da3ff, 0xffd84d, 0xb57bff, 0x7dcf4a, 0xff9a4d];
  for (let i = 0; i < 12; i++) {
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.04, 10, 8),
      mat(beads[i % beads.length])
    );
    const a = (i / 12) * Math.PI * 2;
    bead.position.set(
      Math.cos(a) * 0.55,
      1.65 + Math.random() * 0.4,
      Math.sin(a) * 0.35 - 0.1
    );
    root.add(bead);
  }

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 32),
    new THREE.MeshBasicMaterial({
      color: 0x1a2a60,
      transparent: true,
      opacity: 0.18,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = theme.vessel === "cone" ? -1.5 : -1.66;
  root.add(shadow);

  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}
