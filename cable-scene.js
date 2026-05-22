// cable-scene.js — Three.js cinematic cable scene for Siechem
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeBraidTexture(size = 1024) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 4;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1c2230';
  ctx.fillRect(0, 0, c.width, c.height);
  // diagonal weave
  ctx.lineWidth = 3;
  for (let i = -c.height; i < c.width; i += 9) {
    ctx.strokeStyle = 'rgba(180,195,220,0.55)';
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + c.height, c.height);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(50,60,80,0.7)';
    ctx.beginPath();
    ctx.moveTo(i + 4, c.height);
    ctx.lineTo(i + 4 + c.height, 0);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeJacketTexture(size = 1024) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 4;
  const ctx = c.getContext('2d');
  // base
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#15191e');
  grad.addColorStop(0.5, '#0d1117');
  grad.addColorStop(1, '#15191e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  // subtle longitudinal stripes
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
    ctx.fillRect(0, Math.random() * c.height, c.width, 1);
  }
  // print marking
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#c8d4e2';
  ctx.font = 'bold 28px monospace';
  for (let i = 0; i < 8; i++) {
    ctx.fillText('SIECHEM  ·  E-BEAM XLPE  ·  600V  ·  90°C  ·  ', i * 280, 80);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCopperTexture(size = 512) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 4;
  const ctx = c.getContext('2d');
  // base copper
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#7a3b18');
  grad.addColorStop(0.5, '#d4762d');
  grad.addColorStop(1, '#7a3b18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  // fine strand lines (stranded copper)
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < c.height; i += 2) {
    ctx.fillStyle = i % 4 === 0 ? '#fda86a' : '#5a2810';
    ctx.fillRect(0, i, c.width, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Reveal shader injection — discards tube fragments past uReveal (along v of TubeGeometry).
// Adds a thin warm edge glow at the discard frontier.
function applyRevealShader(material, edgeColor = new THREE.Color(0xe31e24)) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = { value: 1.0 };
    shader.uniforms.uPeelDir = { value: 1.0 };
    shader.uniforms.uEdgeColor = { value: edgeColor };
    material.userData.shader = shader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>\nvarying float vTubeV;`,
    ).replace(
      '#include <uv_vertex>',
      `#include <uv_vertex>\nvTubeV = uv.x;`,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uReveal;
       uniform float uPeelDir;
       uniform vec3 uEdgeColor;
       varying float vTubeV;`,
    ).replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       float vCoord = uPeelDir > 0.0 ? vTubeV : (1.0 - vTubeV);
       if (vCoord > uReveal) discard;
       float edge = smoothstep(uReveal - 0.012, uReveal, vCoord);
       gl_FragColor.rgb = mix(gl_FragColor.rgb, uEdgeColor, edge * 0.85);
       gl_FragColor.rgb += uEdgeColor * edge * 0.6;`,
    );
  };
}

function setReveal(material, v) {
  const s = material.userData.shader;
  if (s) s.uniforms.uReveal.value = v;
}

// ─── Cable construction ───────────────────────────────────────────────────

function buildSpineCurve() {
  const pts = [];
  const len = 10;
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = (t - 0.5) * len;
    const y = Math.sin(t * Math.PI * 1.3) * 0.55 + (t - 0.5) * 0.15;
    const z = Math.cos(t * Math.PI * 0.9) * 0.4 - 0.2;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function makeConductorCurve(spine, radialOffset, angleOffset, turns, samples) {
  const N = samples;
  const frames = spine.computeFrenetFrames(N, false);
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = spine.getPointAt(t);
    const idx = Math.min(i, N - 1);
    const normal = frames.normals[idx];
    const binormal = frames.binormals[idx];
    const angle = angleOffset + t * turns * Math.PI * 2;
    const off = normal.clone().multiplyScalar(Math.cos(angle) * radialOffset)
      .add(binormal.clone().multiplyScalar(Math.sin(angle) * radialOffset));
    pts.push(p.clone().add(off));
  }
  return new THREE.CatmullRomCurve3(pts);
}

const CONDUCTOR_COLORS = [
  0xb22f2f, // red
  0x000000, // black
  0xd9b836, // yellow
  0x2a6cb8, // blue
  0x2e8a4a, // green
  0xb86b2a, // brown
  0xd0d0d0, // white (center)
];

export function buildCable(textures) {
  const group = new THREE.Group();
  const spine = buildSpineCurve();
  const TUBE_SEGMENTS = 220;
  const RADIAL_SEGMENTS = 32;

  // ── JACKET (outer)
  const jacketGeo = new THREE.TubeGeometry(spine, TUBE_SEGMENTS, 0.55, RADIAL_SEGMENTS, false);
  const jacketMat = new THREE.MeshPhysicalMaterial({
    color: 0x14181f,
    roughness: 0.55,
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.35,
    map: textures.jacket,
  });
  textures.jacket.repeat.set(6, 1);
  applyRevealShader(jacketMat, new THREE.Color(0xe31e24));
  const jacket = new THREE.Mesh(jacketGeo, jacketMat);
  group.add(jacket);

  // ── BRAIDED SHIELD
  const shieldGeo = new THREE.TubeGeometry(spine, TUBE_SEGMENTS, 0.46, RADIAL_SEGMENTS, false);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x8aa0bf,
    roughness: 0.28,
    metalness: 0.92,
    map: textures.braid,
  });
  textures.braid.repeat.set(8, 1);
  applyRevealShader(shieldMat, new THREE.Color(0xe31e24));
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  group.add(shield);

  // ── INNER BEDDING (filler around conductors)
  const beddingGeo = new THREE.TubeGeometry(spine, TUBE_SEGMENTS, 0.38, RADIAL_SEGMENTS, false);
  const beddingMat = new THREE.MeshStandardMaterial({
    color: 0x1a1f28,
    roughness: 0.9,
    metalness: 0.0,
  });
  applyRevealShader(beddingMat, new THREE.Color(0xe31e24));
  const bedding = new THREE.Mesh(beddingGeo, beddingMat);
  group.add(bedding);

  // ── 7 CONDUCTORS (1 center + 6 around)
  const conductorsGroup = new THREE.Group();
  const conductorMeshes = [];
  const CONDUCTOR_R = 0.105;   // insulation radius
  const COPPER_R = 0.065;      // inner copper radius
  const HELIX_R = 0.21;        // distance from spine for outer 6
  const TURNS = 1.4;

  for (let i = 0; i < 7; i++) {
    const isCenter = (i === 6);
    const angle = (i / 6) * Math.PI * 2;
    const conductorCurve = makeConductorCurve(
      spine,
      isCenter ? 0 : HELIX_R,
      angle,
      isCenter ? 0 : TURNS,
      TUBE_SEGMENTS,
    );

    // Insulation
    const insGeo = new THREE.TubeGeometry(conductorCurve, TUBE_SEGMENTS, CONDUCTOR_R, 16, false);
    const insMat = new THREE.MeshPhysicalMaterial({
      color: CONDUCTOR_COLORS[i],
      roughness: 0.32,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
      sheen: 0.2,
    });
    applyRevealShader(insMat, new THREE.Color(0xe31e24));
    const insulation = new THREE.Mesh(insGeo, insMat);

    // Copper core
    const cuGeo = new THREE.TubeGeometry(conductorCurve, TUBE_SEGMENTS, COPPER_R, 12, false);
    const cuMat = new THREE.MeshStandardMaterial({
      color: 0xd07a35,
      roughness: 0.22,
      metalness: 1.0,
      map: textures.copper,
      emissive: 0x3a1605,
      emissiveIntensity: 0.18,
    });
    textures.copper.repeat.set(20, 1);
    applyRevealShader(cuMat, new THREE.Color(0xe31e24));

    const copper = new THREE.Mesh(cuGeo, cuMat);

    const conductorMesh = new THREE.Group();
    conductorMesh.add(insulation);
    conductorMesh.add(copper);
    // Store fan-out direction (radial unit vector at midpoint)
    const mid = conductorCurve.getPointAt(0.5);
    const spineMid = spine.getPointAt(0.5);
    conductorMesh.userData.fanDir = mid.clone().sub(spineMid).normalize();
    if (isCenter) {
      // Pick a default fan direction for the center conductor (up)
      conductorMesh.userData.fanDir = new THREE.Vector3(0, 1, 0);
    }
    conductorMesh.userData.fanOffsetScale = isCenter ? 0.9 : 1.0;
    conductorMesh.userData.insulationMat = insMat;
    conductorMesh.userData.copperMat = cuMat;
    conductorMesh.userData.isCenter = isCenter;
    conductorMesh.userData.colorIdx = i;

    conductorsGroup.add(conductorMesh);
    conductorMeshes.push(conductorMesh);
  }
  group.add(conductorsGroup);

  // ── CURRENT PARTICLES along the outer jacket surface (visible in final scene)
  const centerCurve = makeConductorCurve(spine, 0.58, 0, 1.2, 200);
  const PARTICLE_COUNT = 80;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const offsets = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    offsets[i] = i / PARTICLE_COUNT;
    const p = centerCurve.getPointAt(offsets[i]);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xff4d54,
    size: 0.08,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);

  // Store refs
  group.userData = {
    spine,
    centerCurve,
    jacket,
    shield,
    bedding,
    conductorsGroup,
    conductorMeshes,
    particles,
    particleOffsets: offsets,
    particlePositions: positions,
    particleGeo,
    materials: { jacket: jacketMat, shield: shieldMat, bedding: beddingMat },
  };

  return group;
}

// ─── Scene ────────────────────────────────────────────────────────────────

export function initCableScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf8fafc, 12, 28);

  // Environment
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envScene = new RoomEnvironment();
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;

  // Camera
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  camera.position.set(0, 0.4, 8);

  // Lights — cinematic 3-point
  const key = new THREE.DirectionalLight(0xfff0d8, 1.6);
  key.position.set(6, 8, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8eb2ff, 1.2);
  rim.position.set(-6, -3, -5);
  scene.add(rim);

  const accent = new THREE.PointLight(0xe31e24, 1.0, 8, 1.5);
  accent.position.set(0, 0, 2);
  scene.add(accent);

  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  // Textures + cable
  const textures = {
    jacket: makeJacketTexture(),
    braid: makeBraidTexture(),
    copper: makeCopperTexture(),
  };
  const cable = buildCable(textures);
  scene.add(cable);

  // Resize
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  return {
    scene, camera, renderer, cable, textures,
    lights: { key, rim, accent, ambient },
    onResize,
  };
}

// ─── Easing ────────────────────────────────────────────────────────────────
export const ease = {
  smooth: (t) => t * t * (3 - 2 * t),
  inOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
};

// Map a value in [a, b] to [0, 1], clamped
export function range(v, a, b) {
  return Math.max(0, Math.min(1, (v - a) / (b - a)));
}

// Lerp helper
export function lerp(a, b, t) { return a + (b - a) * t; }

// Update reveal helpers
export { setReveal };
