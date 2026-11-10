import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const COLUMNS = 6;
const GAP = 0.035;
const PITCH = 1 + GAP;
const THICK = 0.085;
const FOV = 22;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 5;
const smooth = (t: number) => t * t * (3 - 2 * t);
const OPEN_SECONDS = 0.35;
const CLOSE_SECONDS = 0.35;
const inOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export const FOCUS_SCALE = 1.45;
const FOCUS_LIFT = 0.9;

export type SceneOptions = {
  anchor: HTMLElement;
  designs: string[];
  load: (design: string) => Promise<HTMLCanvasElement>;
  reduced: boolean;
};

export type TileScene = {
  start: () => void;
  hover: (x: number, y: number) => number | null;
  pick: (x: number, y: number) => number | null;
  pickElevated: (x: number, y: number) => boolean;
  elevate: (index: number) => void;
  release: () => void;
  swapTo: (design: string) => Promise<void>;
  dragStart: (x: number, y: number) => void;
  dragMove: (x: number, y: number) => void;
  dragEnd: () => void;
  dispose: () => void;
};

type Spring = { value: number; target: number; velocity: number };
type Tile = {
  index: number;
  group: THREE.Group;
  meshes: THREE.Mesh[];
  glazeMat: THREE.MeshPhysicalMaterial;
  bodyMat: THREE.MeshStandardMaterial;
  backMat: THREE.MeshStandardMaterial;
  groutMat: THREE.MeshStandardMaterial;
  design: string;
  delay: number;
  hover: number;
  lift: number;
  rotY: Spring;
  rotX: Spring;
  pop: { value: number; velocity: number };
  swapToken: number;
};

function noiseCanvas(size: number, cells: number, seed: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    return canvas;
  }
  const random = (n: number) => {
    const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = 0;
      let amplitude = 0.55;
      let frequency = cells;
      for (let octave = 0; octave < 3; octave++) {
        const fx = (x / size) * frequency;
        const fy = (y / size) * frequency;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = smooth(fx - x0);
        const ty = smooth(fy - y0);
        const n = (px: number, py: number) => random((px % frequency) * 57 + (py % frequency) * 131 + octave * 17);
        const top = n(x0, y0) * (1 - tx) + n(x0 + 1, y0) * tx;
        const bottom = n(x0, y0 + 1) * (1 - tx) + n(x0 + 1, y0 + 1) * tx;
        value += (top * (1 - ty) + bottom * ty) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      const shade = Math.round(clamp01(value / 0.95) * 255);
      const offset = (y * size + x) * 4;
      image.data[offset] = shade;
      image.data[offset + 1] = shade;
      image.data[offset + 2] = shade;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

function backCanvas(grain: HTMLCanvasElement) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) {
    return canvas;
  }
  context.fillStyle = '#cdbfa9';
  context.fillRect(0, 0, 512, 512);
  context.globalCompositeOperation = 'multiply';
  context.globalAlpha = 0.28;
  context.filter = 'blur(2px)';
  context.drawImage(grain, 0, 0, 512, 512);
  context.filter = 'none';
  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
  context.strokeStyle = 'rgba(70,48,24,0.28)';
  context.lineWidth = 3;
  for (let step = 1; step < 8; step++) {
    context.beginPath();
    context.moveTo(step * 64, 24);
    context.lineTo(step * 64, 488);
    context.moveTo(24, step * 64);
    context.lineTo(488, step * 64);
    context.stroke();
  }
  context.fillStyle = 'rgba(70,48,24,0.55)';
  context.font = '600 38px ui-sans-serif, system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('M O S A I C', 256, 256);
  return canvas;
}

function glazeCanvas(art: HTMLCanvasElement, mottle: HTMLCanvasElement) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    return canvas;
  }
  context.drawImage(art, 0, 0, size, size);
  context.globalCompositeOperation = 'multiply';
  context.globalAlpha = 0.22;
  context.drawImage(mottle, 0, 0, size, size);
  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
  context.strokeStyle = 'rgba(40,25,90,0.2)';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(size / 2, 0);
  context.lineTo(size / 2, size);
  context.moveTo(0, size / 2);
  context.lineTo(size, size / 2);
  context.stroke();
  return canvas;
}

export function createTileScene(canvas: HTMLCanvasElement, options: SceneOptions): TileScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  scene.environment = pmrem.fromScene(environment, 0.04).texture;
  scene.environmentIntensity = 0.6;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  const key = new THREE.DirectionalLight(0xfff1e0, 1.9);
  key.position.set(0, 3.4, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.bias = -0.0005;
  key.shadow.radius = 4;
  const underlight = new THREE.DirectionalLight(0xfff1e0, 1.5);
  underlight.position.set(0, -3.2, 5);
  const hemi = new THREE.HemisphereLight(0xffffff, 0xa898e8, 0.75);
  scene.add(key, underlight, hemi);

  const grain = noiseCanvas(512, 64, 3);
  const mottle = noiseCanvas(256, 7, 11);
  const grainTexture = new THREE.CanvasTexture(grain);
  grainTexture.wrapS = THREE.RepeatWrapping;
  grainTexture.wrapT = THREE.RepeatWrapping;
  const backTexture = new THREE.CanvasTexture(backCanvas(grain));
  backTexture.colorSpace = THREE.SRGBColorSpace;
  const textures = new Map<string, THREE.CanvasTexture>();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const bodyGeometry = new RoundedBoxGeometry(1, 1, THICK, 4, 0.035);
  const glazeGeometry = new RoundedBoxGeometry(0.97, 0.97, 0.034, 4, 0.014);
  const backGeometry = new THREE.PlaneGeometry(0.88, 0.88);
  const groutGeometry = new THREE.BoxGeometry(PITCH, PITCH, 0.05);
  geometries.push(bodyGeometry, glazeGeometry, backGeometry, groutGeometry);

  const getTexture = async (design: string) => {
    const cached = textures.get(design);
    if (cached) {
      return cached;
    }
    const art = await options.load(design);
    const texture = new THREE.CanvasTexture(glazeCanvas(art, mottle));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.set(design, texture);
    return texture;
  };

  const tiles: Tile[] = options.designs.map((design, index) => {
    const group = new THREE.Group();
    const glazeMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.68,
      roughnessMap: grainTexture,
      bumpMap: grainTexture,
      bumpScale: 0.18,
      clearcoat: 0.1,
      clearcoatRoughness: 0.7,
      transparent: true,
      opacity: 0,
    });
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#d6c9b5',
      roughness: 0.96,
      bumpMap: grainTexture,
      bumpScale: 0.5,
      transparent: true,
      opacity: 0,
    });
    const backMat = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 1,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const groutMat = new THREE.MeshStandardMaterial({
      color: '#cfc8e2',
      roughness: 1,
      bumpMap: grainTexture,
      bumpScale: 0.6,
      transparent: true,
      opacity: 0,
    });
    materials.push(glazeMat, bodyMat, backMat, groutMat);
    const body = new THREE.Mesh(bodyGeometry, bodyMat);
    body.position.z = -THICK / 2;
    const glaze = new THREE.Mesh(glazeGeometry, glazeMat);
    glaze.position.z = 0.008;
    const back = new THREE.Mesh(backGeometry, backMat);
    back.position.z = -THICK - 0.001;
    back.rotation.y = Math.PI;
    const grout = new THREE.Mesh(groutGeometry, groutMat);
    grout.position.z = -0.055;
    grout.receiveShadow = true;
    grout.userData.index = index;
    const meshes = [body, glaze, grout];
    for (const mesh of [body, glaze]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.index = index;
    }
    group.add(grout, body, glaze, back);
    group.position.set(((index % COLUMNS) - (COLUMNS - 1) / 2) * PITCH, (0.5 - Math.floor(index / COLUMNS)) * PITCH, 0);
    group.visible = false;
    scene.add(group);
    return {
      index,
      group,
      meshes,
      glazeMat,
      bodyMat,
      backMat,
      groutMat,
      design,
      delay: 0.4 + (index % COLUMNS) * 0.07 + Math.floor(index / COLUMNS) * 0.05,
      hover: 0,
      lift: 0,
      rotY: { value: 0, target: 0, velocity: 0 },
      rotX: { value: 0, target: 0, velocity: 0 },
      pop: { value: 0, velocity: 0 },
      swapToken: 0,
    };
  });

  const applyDesign = async (tile: Tile, design: string) => {
    const texture = await getTexture(design);
    tile.glazeMat.map = texture;
    tile.glazeMat.needsUpdate = true;
    tile.design = design;
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const allMeshes = tiles.flatMap(tile => tile.meshes);
  const castAt = (x: number, y: number) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((x - rect.left) / rect.width) * 2 - 1, -(((y - rect.top) / rect.height) * 2 - 1));
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(allMeshes, false)[0];
    return hit ? (hit.object.userData.index as number) : null;
  };

  let elevated: number | null = null;
  let started = false;
  let startTime = 0;
  let last = performance.now();
  let frame = 0;
  let hovered: number | null = null;
  let dragging: { x: number; y: number; vx: number } | null = null;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let swayX = 0;
  let swayY = 0;
  let sizeW = 0;
  let sizeH = 0;
  const helper = new THREE.Object3D();
  const entranceQuaternion = new THREE.Quaternion();
  const userQuaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const home = new THREE.Vector3();
  const stepPop = (pop: Tile['pop'], dt: number) => {
    pop.velocity += (-pop.value * 320 - pop.velocity * 18) * dt;
    pop.value += pop.velocity * dt;
  };
  const stepSpring = (spring: Spring, dt: number, stiffness = 90, damping = 19) => {
    const force = (spring.target - spring.value) * stiffness - spring.velocity * damping;
    spring.velocity += force * dt;
    spring.value += spring.velocity * dt;
  };

  const tick = () => {
    frame = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    const canvasRect = canvas.getBoundingClientRect();
    const cw = canvasRect.width;
    const ch = canvasRect.height;
    const rect = options.anchor.getBoundingClientRect();
    if (rect.width < 2 || cw < 2 || ch < 2) {
      return;
    }
    if (cw !== sizeW || ch !== sizeH) {
      sizeW = cw;
      sizeH = ch;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
    }
    const scale = rect.width / (COLUMNS * PITCH);
    const distance = ch / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)) / scale;
    const baseX = (canvasRect.left + cw / 2 - (rect.left + rect.width / 2)) / scale;
    const baseY = (rect.top + rect.height / 2 - (canvasRect.top + ch / 2)) / scale;
    const pace = options.reduced ? 0.4 : 1;
    let maxLift = 0;
    for (const tile of tiles) {
      tile.lift = clamp01(
        tile.lift + (elevated === tile.index ? dt / (OPEN_SECONDS * pace) : -dt / (CLOSE_SECONDS * pace)),
      );
      maxLift = Math.max(maxLift, tile.lift);
    }
    if (!options.reduced && elevated === null && maxLift <= 0) {
      swayX += ((pointerX - 0.5) * 1.1 - swayX) * (1 - Math.exp(-dt * 3));
      swayY += ((0.5 - pointerY) * 0.6 - swayY) * (1 - Math.exp(-dt * 3));
    }
    camera.position.set(baseX + swayX, baseY + swayY, distance);
    camera.lookAt(baseX, baseY, 0);
    key.position.set(baseX + (pointerX - 0.5) * 3, baseY + 3.4, 5);
    underlight.position.set(baseX + (pointerX - 0.5) * 3, baseY - 3.2, 5);
    underlight.target.position.set(baseX, baseY, 0);
    underlight.target.updateMatrixWorld();
    key.target.position.set(baseX, baseY, 0);
    key.target.updateMatrixWorld();
    const elapsed = started ? (now - startTime) / 1000 : -1;
    for (const tile of tiles) {
      const own = options.reduced ? 1 : clamp01((elapsed - tile.delay) / 0.9);
      const e = started ? easeOut(own) : 0;
      tile.group.visible = started && own > 0;
      const travel = inOut(tile.lift);
      let otherLift = 0;
      for (const other of tiles) {
        if (other !== tile) {
          otherLift = Math.max(otherLift, other.lift);
        }
      }
      const hoverOn = hovered === tile.index && elevated === null && maxLift <= 0.01;
      tile.hover += ((hoverOn ? 1 : 0) - tile.hover) * (1 - Math.exp(-dt * 12));
      const ep = travel;
      const zp = travel;
      home.set(
        ((tile.index % COLUMNS) - (COLUMNS - 1) / 2) * PITCH,
        (0.5 - Math.floor(tile.index / COLUMNS)) * PITCH,
        (1 - e) * 1.4 + tile.hover * 0.16,
      );
      tile.group.position.set(home.x, home.y, home.z + (FOCUS_LIFT - home.z) * zp);
      stepPop(tile.pop, dt);
      const pop = 1 + tile.pop.value;
      const size = 1 + (1 - e) * 0.28;
      tile.group.scale.setScalar((size + (FOCUS_SCALE - size) * ep) * pop);
      if (elevated === tile.index && dragging) {
        stepSpring(tile.rotY, dt, 420, 41);
      } else {
        stepSpring(tile.rotY, dt, 110, 13);
      }
      stepSpring(tile.rotX, dt);
      entranceQuaternion.setFromEuler(
        euler.set((1 - e) * 0.4 - tile.hover * 0.04, (1 - e) * (tile.index % 2 === 0 ? 0.25 : -0.25), 0),
      );
      if (ep > 0) {
        helper.position.copy(tile.group.position);
        helper.updateMatrixWorld();
        helper.lookAt(camera.position);
        entranceQuaternion.slerp(helper.quaternion, ep);
      }
      userQuaternion.setFromEuler(euler.set(tile.rotX.value, tile.rotY.value, 0));
      tile.group.quaternion.copy(entranceQuaternion).multiply(userQuaternion);
      const dim = 1 - 0.55 * smooth(otherLift);
      const opacity = clamp01(own * 3) * dim;
      for (const material of [tile.glazeMat, tile.bodyMat, tile.backMat, tile.groutMat]) {
        material.opacity = opacity;
        material.transparent = opacity < 0.999;
      }
    }
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);

  const ready = Promise.all(tiles.map(tile => applyDesign(tile, tile.design)));

  return {
    start: () => {
      void ready.then(() => {
        started = true;
        startTime = performance.now();
      });
    },
    hover: (x, y) => {
      pointerX = x / window.innerWidth;
      pointerY = y / window.innerHeight;
      hovered = castAt(x, y);
      return hovered;
    },
    pick: (x, y) => castAt(x, y),
    pickElevated: (x, y) => elevated !== null && castAt(x, y) === elevated,
    elevate: index => {
      if (elevated !== null && elevated !== index) {
        const previous = tiles[elevated];
        previous.rotY.target = Math.round(previous.rotY.value / (Math.PI * 2)) * Math.PI * 2;
        previous.rotX.target = 0;
      }
      dragging = null;
      elevated = index;
      hovered = null;
      const tile = tiles[index];
      tile.hover = 0;
      tile.rotY.value = tile.rotY.value % (Math.PI * 2);
      tile.rotY.target = Math.round(tile.rotY.value / Math.PI) * Math.PI;
    },
    release: () => {
      const tile = elevated === null ? null : tiles[elevated];
      if (tile) {
        tile.rotY.target = Math.round(tile.rotY.value / (Math.PI * 2)) * Math.PI * 2;
        tile.rotX.target = 0;
      }
      dragging = null;
      elevated = null;
    },
    swapTo: async design => {
      if (elevated === null) {
        return;
      }
      const tile = tiles[elevated];
      const token = ++tile.swapToken;
      await applyDesign(tile, design);
      if (token !== tile.swapToken) {
        return;
      }
      tile.pop.velocity = -0.9;
    },
    dragStart: (x, y) => {
      if (dragging) {
        return;
      }
      dragging = { x, y, vx: 0 };
      if (elevated !== null) {
        tiles[elevated].rotY.target = tiles[elevated].rotY.value;
      }
    },
    dragMove: (x, y) => {
      if (!dragging || elevated === null) {
        return;
      }
      const tile = tiles[elevated];
      const dx = x - dragging.x;
      dragging.x = x;
      dragging.y = y;
      dragging.vx = dragging.vx * 0.6 + dx * 0.4;
      tile.rotY.target += dx * 0.011;
    },
    dragEnd: () => {
      if (dragging && elevated !== null) {
        const tile = tiles[elevated];
        tile.rotY.target = Math.round((tile.rotY.target + dragging.vx * 0.12) / Math.PI) * Math.PI;
      }
      dragging = null;
    },
    dispose: () => {
      cancelAnimationFrame(frame);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
      grainTexture.dispose();
      backTexture.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
