import * as THREE from "three";
import { colorOf } from "./colors.js";

/** Create a screw mesh group for a given color */
export function createScrewMesh(colorId, toolKind = null) {
  const c = colorOf(colorId);
  const group = new THREE.Group();
  group.userData = { color: colorId, tool: toolKind, isScrew: true };

  const headColor = c.hex;
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20),
    new THREE.MeshStandardMaterial({
      color: headColor,
      roughness: 0.35,
      metalness: 0.35,
    })
  );
  head.rotation.x = Math.PI / 2;
  group.add(head);

  // Plus slot
  const slotMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.1,
  });
  const slot1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.04, 0.03),
    slotMat
  );
  slot1.position.z = 0.05;
  group.add(slot1);
  const slot2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.16, 0.03),
    slotMat
  );
  slot2.position.z = 0.05;
  group.add(slot2);

  // Shaft
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

  // Thread hint
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

  // Slightly larger hit target (invisible)
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0,
    })
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
 * Place screws on a shell around the dessert.
 * Returns array of { mesh, color, tool, id }
 */
export function placeScrews(parent, screwDefs) {
  const result = [];
  const n = screwDefs.length;
  // Fibonacci sphere + height bias toward body/glass
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    const def = screwDefs[i];
    const tool =
      def.tool ||
      (def.color === "orange"
        ? "wrench"
        : def.color === "white"
          ? "drill"
          : `screwdriver-${def.color}`);

    const mesh = createScrewMesh(def.color, tool);
    const y = 1 - (i / Math.max(n - 1, 1)) * 2; // -1..1
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;

    // Shell around dessert ~ radius 1.35–1.7
    const r = 1.35 + (i % 5) * 0.06;
    const px = Math.cos(theta) * radiusAtY * r;
    const py = y * 1.15 + 0.35;
    const pz = Math.sin(theta) * radiusAtY * r * 0.95;

    mesh.position.set(px, py, pz);

    // Orient head outward
    const outward = new THREE.Vector3(px, py * 0.4, pz).normalize();
    const zAxis = new THREE.Vector3(0, 0, 1);
    mesh.quaternion.setFromUnitVectors(zAxis, outward);

    // Tiny random spin for variety
    mesh.rotateOnAxis(outward, ((i * 37) % 360) * (Math.PI / 180));

    parent.add(mesh);
    const id = `screw-${i}`;
    mesh.userData.id = id;
    mesh.userData.color = def.color;
    mesh.userData.tool = tool;
    mesh.userData.isScrew = true;
    mesh.userData.baseScale = 1;

    result.push({
      id,
      mesh,
      color: def.color,
      tool,
      removed: false,
    });
  }

  return result;
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
