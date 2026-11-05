import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

import { context2d } from '@/lib/mosaic-tools/canvas';

import { LOGO_PARTS, LOGO_SIZE } from './clerk-logo';
import type { MosaicSettings } from './settings';
const CENTER = LOGO_SIZE / 2;
const RASTER = 24;
const VIOLET = new THREE.Color('#6C47FF');
const STONE = ['#ffffff', '#e6e6e6', '#cfcfcf', '#b8b8b8'];
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
type Tile = {
  x: number;
  y: number;
  tone: number;
  r1: number;
  r2: number;
  r3: number;
  sx: number;
  sy: number;
};
export class MosaicLogoScene {
  private container: HTMLElement;
  private settings: MosaicSettings;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  private root = new THREE.Group();
  private logoGroup = new THREE.Group();
  private logoMeshes: THREE.Mesh[] = [];
  private tilesMesh: THREE.InstancedMesh | null = null;
  private tiles: Tile[] = [];
  private clip = { value: new THREE.Vector4(0, 0, 0, 0) };
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private ndc = new THREE.Vector2();
  private pointer = new THREE.Vector2(CENTER, CENTER);
  private smoothPointer = new THREE.Vector2(CENTER, CENTER);
  private hoverTarget = 0;
  private hover = 0;
  private lastInteraction = -Infinity;
  private clock = new THREE.Clock();
  private raf = 0;
  private resizeObserver: ResizeObserver;
  private reducedMotion: boolean;
  private dummy = new THREE.Object3D();
  private tmp = new THREE.Vector3();
  constructor(container: HTMLElement, settings: MosaicSettings) {
    this.container = container;
    this.settings = settings;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(-8, 12, 16);
    const rim = new THREE.DirectionalLight(0xb9c4ff, 0.8);
    rim.position.set(10, -6, 8);
    this.scene.add(key, rim);
    this.logoGroup.scale.set(1, -1, 1);
    this.logoGroup.position.set(-CENTER, CENTER, 0);
    this.root.add(this.logoGroup);
    this.scene.add(this.root);
    this.buildLogo();
    this.buildTiles();
    container.addEventListener('pointermove', this.onPointerMove);
    container.addEventListener('pointerdown', this.onPointerMove);
    container.addEventListener('pointerleave', this.onPointerLeave);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(container);
    this.resize();
    this.clock.start();
    this.raf = requestAnimationFrame(this.frame);
  }
  update(next: MosaicSettings) {
    const prev = this.settings;
    this.settings = next;
    if (prev.depth !== next.depth) {
      this.buildLogo();
    }
    if (
      prev.depth !== next.depth ||
      prev.tileSize !== next.tileSize ||
      prev.gap !== next.gap ||
      prev.palette !== next.palette
    ) {
      this.buildTiles();
    }
  }
  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('pointerdown', this.onPointerMove);
    this.container.removeEventListener('pointerleave', this.onPointerLeave);
    this.disposeLogo();
    this.disposeTiles();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
  private disposeLogo() {
    for (const mesh of this.logoMeshes) {
      this.logoGroup.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    this.logoMeshes = [];
  }
  private disposeTiles() {
    if (!this.tilesMesh) {
      return;
    }
    this.logoGroup.remove(this.tilesMesh);
    this.tilesMesh.geometry.dispose();
    (this.tilesMesh.material as THREE.Material).dispose();
    this.tilesMesh.dispose();
    this.tilesMesh = null;
  }
  private buildLogo() {
    this.disposeLogo();
    const { depth } = this.settings;
    const loader = new SVGLoader();
    for (const part of LOGO_PARTS) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO_SIZE} ${LOGO_SIZE}"><path d="${part.d}"/></svg>`;
      const shapes = loader.parse(svg).paths.flatMap(path => SVGLoader.createShapes(path));
      const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth,
        curveSegments: 28,
        bevelEnabled: true,
        bevelSize: 0.07,
        bevelThickness: 0.07,
        bevelSegments: 2,
      });
      geometry.translate(0, 0, -depth / 2);
      const material = new THREE.MeshStandardMaterial({
        color: part.tone === 1 ? 0xffffff : 0x8d8d8d,
        roughness: 0.42,
        metalness: 0.05,
      });
      material.onBeforeCompile = shader => {
        shader.uniforms.uClip = this.clip;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vMosaicPos;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMosaicPos = position;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform vec4 uClip;\nvarying vec3 vMosaicPos;')
          .replace(
            'void main() {',
            'void main() {\n  if (uClip.w > 0.5 || (uClip.z > 0.0 && distance(vMosaicPos.xy, uClip.xy) < uClip.z)) discard;',
          );
      };
      const mesh = new THREE.Mesh(geometry, material);
      this.logoMeshes.push(mesh);
      this.logoGroup.add(mesh);
    }
  }
  private buildTiles() {
    this.disposeTiles();
    const { tileSize, gap, depth, palette } = this.settings;
    const size = LOGO_SIZE * RASTER;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = context2d(canvas, { willReadFrequently: true });
    ctx.scale(RASTER, RASTER);
    for (const part of LOGO_PARTS) {
      ctx.fillStyle = part.tone === 1 ? '#ffffff' : '#808080';
      ctx.fill(new Path2D(part.d));
    }
    const pixels = ctx.getImageData(0, 0, size, size).data;
    const cells = Math.ceil(LOGO_SIZE / tileSize);
    const origin = (LOGO_SIZE - cells * tileSize) / 2;
    const rand = seeded(7);
    const tiles: Tile[] = [];
    const offsets = [-1 / 3, 0, 1 / 3];
    for (let j = 0; j < cells; j++) {
      for (let i = 0; i < cells; i++) {
        const cx = origin + (i + 0.5) * tileSize;
        const cy = origin + (j + 0.5) * tileSize;
        let covered = 0;
        let toneSum = 0;
        for (const ox of offsets) {
          for (const oy of offsets) {
            const px = Math.floor((cx + ox * tileSize) * RASTER);
            const py = Math.floor((cy + oy * tileSize) * RASTER);
            if (px < 0 || py < 0 || px >= size || py >= size) {
              continue;
            }
            const k = (py * size + px) * 4;
            if (pixels[k + 3] > 128) {
              covered++;
              toneSum += pixels[k] / 255;
            }
          }
        }
        if (covered < 4) {
          continue;
        }
        tiles.push({
          x: cx,
          y: cy,
          tone: toneSum / covered > 0.75 ? 1 : 0.5,
          r1: rand(),
          r2: rand(),
          r3: rand(),
          sx: Math.round((rand() - 0.5) * 6),
          sy: Math.round((rand() - 0.5) * 6),
        });
      }
    }
    this.tiles = tiles;
    const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.05,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, tiles.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    const color = new THREE.Color();
    tiles.forEach((tile, index) => {
      if (palette === 'mono') {
        color.setScalar(0.74 + tile.r1 * 0.26);
      } else if (palette === 'stone') {
        color.set(STONE[Math.floor(tile.r1 * STONE.length)]);
      } else {
        color.setScalar(tile.tone === 1 ? 1 : 0.5);
        if (palette === 'accent' && tile.r2 < 0.1) {
          color.copy(VIOLET);
        }
      }
      mesh.setColorAt(index, color);
    });
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.userData.size = tileSize * (1 - gap);
    mesh.userData.depth = Math.min(depth * 0.85, tileSize * 0.7);
    this.tilesMesh = mesh;
    this.logoGroup.add(mesh);
  }
  private onPointerMove = (event: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.root.updateMatrixWorld();
    if (!this.raycaster.ray.intersectPlane(this.plane, this.tmp)) {
      return;
    }
    this.logoGroup.worldToLocal(this.tmp);
    this.pointer.set(this.tmp.x, this.tmp.y);
    this.lastInteraction = this.clock.elapsedTime;
    this.hoverTarget = Math.hypot(this.pointer.x - CENTER, this.pointer.y - CENTER) < 11 ? 1 : 0;
  };
  private onPointerLeave = () => {
    this.hoverTarget = 0;
    this.lastInteraction = this.clock.elapsedTime;
    this.ndc.set(0, 0);
  };
  private resize = () => {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    const half = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const fitHeight = 13 / half;
    const fitWidth = 14.5 / (half * this.camera.aspect);
    this.camera.position.set(0, 0, Math.max(fitHeight, fitWidth));
    this.camera.updateProjectionMatrix();
  };
  private frame = () => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const s = this.settings;
    if (s.autoplay && t - this.lastInteraction > 2) {
      this.pointer.set(CENTER + Math.cos(t * 0.8) * 6.5, CENTER + Math.sin(t * 1.1) * 5.5);
      this.hoverTarget = t % 7 < 5 ? 1 : 0;
      this.ndc.set((this.pointer.x - CENTER) / 12, -(this.pointer.y - CENTER) / 12);
    }
    const follow = 1 - Math.exp(-dt * 12 * s.speed);
    this.smoothPointer.lerp(this.pointer, follow);
    this.hover += (this.hoverTarget - this.hover) * (1 - Math.exp(-dt * 5 * s.speed));
    if (Math.abs(this.hoverTarget - this.hover) < 0.001) {
      this.hover = this.hoverTarget;
    }
    const tilt = this.reducedMotion ? 0 : THREE.MathUtils.degToRad(s.tilt);
    this.root.rotation.y += (this.ndc.x * tilt - this.root.rotation.y) * follow;
    this.root.rotation.x += (-this.ndc.y * tilt - this.root.rotation.x) * follow;
    this.root.position.y = s.float && !this.reducedMotion ? Math.sin(t * 0.9) * 0.25 : 0;
    this.updateTiles(t);
    this.renderer.render(this.scene, this.camera);
  };
  private updateTiles(t: number) {
    const mesh = this.tilesMesh;
    if (!mesh) {
      return;
    }
    const { effect, radius, strength } = this.settings;
    const size = mesh.userData.size as number;
    const depth = mesh.userData.depth as number;
    const pitch = this.settings.tileSize;
    const eased = smoothstep(0, 1, this.hover);
    const p = this.smoothPointer;
    const R = radius * eased;
    const global = effect === 'explode';
    this.clip.value.set(p.x, p.y, global ? 0 : R * 0.9, global && eased > 0.004 ? 1 : 0);
    const dummy = this.dummy;
    this.tiles.forEach((tile, index) => {
      const dx = tile.x - p.x;
      const dy = tile.y - p.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const w = global ? eased : R > 0.001 ? 1 - smoothstep(R * 0.45, R, dist) : 0;
      const visible = smoothstep(0, 0.22, w);
      let px = tile.x;
      let py = tile.y;
      let pz = 0;
      let rx = 0;
      let ry = 0;
      let rz = 0;
      let scale = visible;
      switch (effect) {
        case 'reveal': {
          pz = w * 0.5 * strength;
          break;
        }
        case 'shatter': {
          const fly = Math.pow(w, 1.4) * strength * (2.2 + tile.r1 * 3.2);
          px += (dx / dist) * fly * 0.9 + (tile.r2 - 0.5) * fly * 0.8;
          py += (dy / dist) * fly * 0.9 + (tile.r3 - 0.5) * fly * 0.8;
          pz = fly * (0.6 + tile.r2 * 2.2);
          rx = (tile.r1 - 0.5) * fly * 1.6;
          ry = (tile.r2 - 0.5) * fly * 1.6;
          rz = (tile.r3 - 0.5) * fly * 2;
          scale = visible * (1 - 0.45 * w);
          break;
        }
        case 'explode': {
          const fx = tile.x - CENTER;
          const fy = tile.y - CENTER;
          const len = Math.hypot(fx, fy) || 1;
          const fly = Math.pow(w, 1.2) * strength * (0.8 + tile.r1 * 2.6);
          const sway = Math.sin(t * 0.9 + tile.r2 * 6.283) * fly * 0.18;
          px += (fx / len) * fly + sway;
          py += (fy / len) * fly + Math.cos(t * 0.8 + tile.r3 * 6.283) * fly * 0.18;
          pz = (tile.r2 - 0.25) * fly * 2.6;
          rx = (tile.r1 - 0.5) * fly * 1.2 + t * 0.2 * w * (tile.r3 - 0.5);
          ry = (tile.r2 - 0.5) * fly * 1.2;
          rz = (tile.r3 - 0.5) * fly * 1.4;
          scale = w > 0.004 ? 1 : 0;
          break;
        }
        case 'ripple': {
          const wave = Math.sin(dist * 1.1 - t * 4);
          rx = (1 - smoothstep(0, 0.7, w)) * (Math.PI / 2);
          ry = wave * w * 0.5 * strength;
          pz = wave * w * 0.9 * strength;
          break;
        }
        case 'shuffle': {
          const move = smoothstep(0.15, 0.85, w) * strength;
          px += tile.sx * pitch * move;
          py += tile.sy * pitch * move;
          pz = Math.sin(Math.PI * Math.min(1, move)) * 1.1;
          rz = Math.sin(Math.PI * Math.min(1, move)) * (tile.r3 - 0.5) * 0.6;
          break;
        }
      }
      dummy.position.set(px, py, pz);
      dummy.rotation.set(rx, ry, rz);
      dummy.scale.set(size * scale, size * scale, depth * Math.max(scale, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
}
