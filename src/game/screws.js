import * as THREE from "three";
import { colorOf } from "./colors.js";

/** Create a screw mesh group for a given color */
export function createScrewMesh(colorId) {
  const c = colorOf(colorId);
  const group = new THREE.Group();
  group.userData = { color: colorId, isScrew: true };

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20),
    new THREE.MeshStandardMaterial({
      color: c.hex,
      roughness: 0.35,
      metalness: 0.35,
    })
  );
  head.rotation.x = Math.PI / 2;
  group.add(head);

  const slotMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.1,
  });
  const slot1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.03), slotMat);
  slot1.position.z = 0.05;
  group.add(slot1);
  const slot2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.03), slotMat);
  slot2.position.z = 0.05;
  group.add(slot2);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.045, 0.35, 12),
    new THREE.MeshStandardMaterial({
      color: 0xc0c8d8,
      roughness: 0.3,
      metalness: 0.6,
    })
  );
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -0.2;
  group.add(shaft);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.1, 10),
    new THREE.MeshStandardMaterial({
      color: 0xa8b0c0,
      metalness: 0.65,
      roughness: 0.3,
    })
  );
  tip.rotation.x = -Math.PI / 2;
  tip.position.z = -0.42;
  group.add(tip);

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 })
  );
  group.add(hit);

  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.userData.screwRoot = group;
    }
  });

  return group;
}

/**
 * Place screws in STACKS around the dessert.
 * Only the top screw of each stack is accessible (layered).
 *
 * @param {THREE.Object3D} parent
 * @param {Array<{color:string}>} screwDefs
 * @param {{ stackCount?: number, maxDepth?: number }} opts
 */
export function placeScrews(parent, screwDefs, opts = {}) {
  const n = screwDefs.length;
  const stackCount = Math.min(
    opts.stackCount ?? Math.max(6, Math.ceil(n / 3)),
    n
  );
  const maxDepth = opts.maxDepth ?? 4;

  // Build stacks: distribute colors into stacks with mixed layers
  const stacks = Array.from({ length: stackCount }, () => []);
  const shuffled = [...screwDefs];
  // mild shuffle for variety but keep some structure
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (i * 17 + 3) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  shuffled.forEach((def, i) => {
    // Prefer shorter stacks, but cap depth
    let best = 0;
    let bestLen = stacks[0].length;
    for (let s = 1; s < stackCount; s++) {
      if (stacks[s].length < bestLen) {
        best = s;
        bestLen = stacks[s].length;
      }
    }
    if (stacks[best].length >= maxDepth) {
      // force into least full
      best = stacks.reduce(
        (bi, st, idx, arr) => (st.length < arr[bi].length ? idx : bi),
        0
      );
    }
    stacks[best].push(def);
  });

  // Ensure at least 2 layers on most stacks when we have enough screws
  const result = [];
  let globalId = 0;

  for (let s = 0; s < stackCount; s++) {
    const stack = stacks[s];
    if (!stack.length) continue;

    // Stack anchor on sphere
    const t = (s + 0.5) / stackCount;
    const y = 1 - t * 1.7; // top-ish to bottom
    const theta = (s / stackCount) * Math.PI * 2 + 0.4;
    const radiusAtY = Math.sqrt(Math.max(0.15, 1 - y * y));
    const baseR = 1.4;

    // Layer 0 = TOP (outer, accessible first), higher index = buried deeper
    for (let layer = 0; layer < stack.length; layer++) {
      const def = stack[layer];
      const mesh = createScrewMesh(def.color);

      // Outer layers farther from center; buried sit deeper
      const r = baseR - layer * 0.14;
      const px = Math.cos(theta) * radiusAtY * r;
      const py = y * 1.1 + 0.4 - layer * 0.05;
      const pz = Math.sin(theta) * radiusAtY * r * 0.95;

      mesh.position.set(px, py, pz);
      const outward = new THREE.Vector3(px, py * 0.35, pz).normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward);

      parent.add(mesh);
      const id = `screw-${globalId++}`;
      mesh.userData.id = id;
      mesh.userData.color = def.color;
      mesh.userData.isScrew = true;
      mesh.userData.stack = s;
      mesh.userData.layer = layer;

      const screw = {
        id,
        mesh,
        color: def.color,
        stack: s,
        layer,
        removed: false,
      };
      result.push(screw);
    }
  }

  updateScrewAccessibility(result);
  return result;
}

/** Top of each stack is accessible; buried screws dimmed */
export function updateScrewAccessibility(screws) {
  const byStack = new Map();
  for (const s of screws) {
    if (s.removed) continue;
    if (!byStack.has(s.stack)) byStack.set(s.stack, []);
    byStack.get(s.stack).push(s);
  }

  for (const s of screws) {
    if (s.removed) continue;
    const stack = byStack.get(s.stack) || [];
    // Lowest layer number remaining is the top (accessible)
    const minLayer = Math.min(...stack.map((x) => x.layer));
    s.accessible = s.layer === minLayer;
    applyScrewLook(s);
  }
}

function applyScrewLook(screw) {
  const mesh = screw.mesh;
  if (screw.accessible) {
    mesh.scale.setScalar(1.05);
    mesh.traverse((o) => {
      if (o.isMesh && o.material && o.material.color && o.material.emissive) {
        o.material.transparent = false;
        o.material.opacity = 1;
        o.material.emissive.setHex(0x222222);
      }
    });
  } else {
    mesh.scale.setScalar(0.88);
    mesh.traverse((o) => {
      if (o.isMesh && o.material && "opacity" in o.material) {
        o.material.transparent = true;
        o.material.opacity = 0.45;
        if (o.material.emissive) o.material.emissive.setHex(0x000000);
      }
    });
  }
}

export function animateScrewOut(mesh, duration = 420) {
  return new Promise((resolve) => {
    const start = performance.now();
    const startPos = mesh.position.clone();
    const dir = startPos.clone().normalize();
    const endPos = startPos.clone().add(dir.multiplyScalar(1.8));
    const startScale = mesh.scale.x;

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      mesh.position.lerpVectors(startPos, endPos, e);
      mesh.rotateZ(0.35);
      mesh.scale.setScalar(startScale * (1 - e * 0.85));
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}
