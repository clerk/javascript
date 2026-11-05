import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { hash, type LabTool } from './canvas';
export type MosaicCubeSettings = {
  theme: 'dark' | 'light';
  trigger: 'loop' | 'click' | 'static';
  speed: number;
  moves: number;
};
export const MOSAIC_CUBE_DEFAULTS: MosaicCubeSettings = {
  theme: 'dark',
  trigger: 'loop',
  speed: 1,
  moves: 14,
};
const LOGO = ['##.##', '.#.#.', '#.#.#', '#.#.#', '#.#.#'];
const SIZE = 5;
const HALF = (SIZE - 1) / 2;
const PALETTES = {
  dark: {
    ink: '#ffffff',
    off: '#18181c',
    shades: ['#141417', '#1c1c21', '#25252b', '#2f2f36', '#3a3a42', '#4a4a53', '#5c5c66'],
    body: '#0a0a0c',
  },
  light: {
    ink: '#18181b',
    off: '#efeff2',
    shades: ['#f7f7f9', '#f1f1f4', '#ebebef', '#e5e5ea', '#dedee4'],
    body: '#fbfbfc',
  },
};
type Move = { axis: 0 | 1 | 2; layer: number; dir: 1 | -1 };
type Phase = 'hold' | 'scramble' | 'pause' | 'solve';
const AXES = ['x', 'y', 'z'] as const;
const FACES = [
  { axis: 0, sign: 1, rotation: [0, Math.PI / 2, 0] },
  { axis: 0, sign: -1, rotation: [0, -Math.PI / 2, 0] },
  { axis: 1, sign: 1, rotation: [-Math.PI / 2, 0, 0] },
  { axis: 1, sign: -1, rotation: [Math.PI / 2, 0, 0] },
  { axis: 2, sign: 1, rotation: [0, 0, 0] },
  { axis: 2, sign: -1, rotation: [0, Math.PI, 0] },
] as const;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const roundedSquare = (size: number, radius: number) => {
  const h = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-h + radius, -h);
  shape.lineTo(h - radius, -h);
  shape.quadraticCurveTo(h, -h, h, -h + radius);
  shape.lineTo(h, h - radius);
  shape.quadraticCurveTo(h, h, h - radius, h);
  shape.lineTo(-h + radius, h);
  shape.quadraticCurveTo(-h, h, -h, h - radius);
  shape.lineTo(-h, -h + radius);
  shape.quadraticCurveTo(-h, -h, -h + radius, -h);
  return new THREE.ShapeGeometry(shape, 4);
};
export class MosaicCube implements LabTool<MosaicCubeSettings> {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private root = new THREE.Group();
  private ambient = new THREE.AmbientLight(0xffffff, 1.5);
  private key = new THREE.DirectionalLight(0xffffff, 1.6);
  private cubies: THREE.Object3D[] = [];
  private bodyGeometry = new RoundedBoxGeometry(0.97, 0.97, 0.97, 3, 0.09);
  private stickerGeometry = roundedSquare(0.82, 0.13);
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private phase: Phase = 'hold';
  private phaseTime = 0;
  private queue: Move[] = [];
  private history: Move[] = [];
  private current: { move: Move; t: number; duration: number; pivot: THREE.Group; cubies: THREE.Object3D[] } | null =
    null;
  private cycle = 0;
  private clickPending = false;
  private tilt = { x: 0, y: 0 };
  private pointer = { x: 0, y: 0, inside: false };
  private clock = new THREE.Clock();
  private raf = 0;
  private observer: ResizeObserver;
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(
    private container: HTMLElement,
    private settings: MosaicCubeSettings,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
    container.appendChild(this.renderer.domElement);
    this.scene.add(this.ambient);
    this.key.position.set(-4, 7, 9);
    this.scene.add(this.key);
    this.scene.add(this.root);
    this.build();
    container.addEventListener('pointermove', this.onMove);
    container.addEventListener('pointerdown', this.onDown);
    container.addEventListener('pointerleave', this.onLeave);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(container);
    this.resize();
  }
  start() {
    this.clock.start();
    this.raf = requestAnimationFrame(this.frame);
  }
  update(next: MosaicCubeSettings) {
    const themeChanged = next.theme !== this.settings.theme;
    this.settings = next;
    if (themeChanged) {
      this.build();
    }
  }
  dispose() {
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.container.removeEventListener('pointermove', this.onMove);
    this.container.removeEventListener('pointerdown', this.onDown);
    this.container.removeEventListener('pointerleave', this.onLeave);
    this.materials.forEach(material => material.dispose());
    this.bodyGeometry.dispose();
    this.stickerGeometry.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
  private material(color: string) {
    let material = this.materials.get(color);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0 });
      this.materials.set(color, material);
    }
    return material;
  }
  private build() {
    this.root.clear();
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
    this.cubies = [];
    this.queue = [];
    this.history = [];
    this.current = null;
    this.phase = 'hold';
    this.phaseTime = 0;
    const palette = PALETTES[this.settings.theme];
    this.ambient.intensity = this.settings.theme === 'light' ? 2.1 : 1.5;
    this.key.intensity = this.settings.theme === 'light' ? 0.9 : 1.6;
    for (let x = -HALF; x <= HALF; x++) {
      for (let y = -HALF; y <= HALF; y++) {
        for (let z = -HALF; z <= HALF; z++) {
          const cubie = new THREE.Group();
          cubie.position.set(x, y, z);
          cubie.add(new THREE.Mesh(this.bodyGeometry, this.material(palette.body)));
          const coords = [x, y, z];
          for (const face of FACES) {
            if (coords[face.axis] !== face.sign * HALF) {
              continue;
            }
            let color =
              palette.shades[
                Math.floor(hash(this.cubies.length * 7.7 + face.axis * 3.1 + face.sign) * palette.shades.length)
              ];
            if (face.axis === 2 && face.sign === 1) {
              color = LOGO[HALF - y][x + HALF] === '#' ? palette.ink : palette.off;
            }
            const sticker = new THREE.Mesh(this.stickerGeometry, this.material(color));
            const normal = [0, 0, 0];
            normal[face.axis] = face.sign * 0.486;
            sticker.position.set(normal[0], normal[1], normal[2]);
            sticker.rotation.set(face.rotation[0], face.rotation[1], face.rotation[2]);
            cubie.add(sticker);
          }
          this.root.add(cubie);
          this.cubies.push(cubie);
        }
      }
    }
  }
  private scramble() {
    const moves: Move[] = [];
    let previous = -1;
    for (let n = 0; n < this.settings.moves; n++) {
      const seed = this.cycle * 57.3 + n * 13.1;
      let axis = Math.floor(hash(seed) * 3) as 0 | 1 | 2;
      let layer = Math.floor(hash(seed + 1) * SIZE) - HALF;
      if (axis * 10 + layer === previous) {
        axis = ((axis + 1) % 3) as 0 | 1 | 2;
        layer = Math.floor(hash(seed + 2) * SIZE) - HALF;
      }
      previous = axis * 10 + layer;
      moves.push({ axis, layer, dir: hash(seed + 3) < 0.5 ? 1 : -1 });
    }
    this.cycle++;
    this.history = moves;
    this.queue = [...moves];
    this.phase = 'scramble';
  }
  private startMove(move: Move, duration: number) {
    const members = this.cubies.filter(cubie => Math.round(cubie.position[AXES[move.axis]]) === move.layer);
    const pivot = new THREE.Group();
    this.root.add(pivot);
    members.forEach(cubie => pivot.attach(cubie));
    this.current = { move, t: 0, duration, pivot, cubies: members };
  }
  private finishMove() {
    const current = this.current;
    if (!current) {
      return;
    }
    current.pivot.rotation[AXES[current.move.axis]] = (current.move.dir * Math.PI) / 2;
    current.pivot.updateMatrixWorld(true);
    this.root.updateMatrixWorld(true);
    for (const cubie of current.cubies) {
      this.root.attach(cubie);
      cubie.position.round();
      const matrix = new THREE.Matrix4().makeRotationFromQuaternion(cubie.quaternion);
      matrix.elements.forEach((value, index) => {
        matrix.elements[index] = Math.round(value);
      });
      cubie.quaternion.setFromRotationMatrix(matrix);
    }
    this.root.remove(current.pivot);
    this.current = null;
  }
  private step(dt: number) {
    const s = this.settings;
    if (this.current) {
      this.current.t += dt / this.current.duration;
      if (this.current.t >= 1) {
        this.finishMove();
      } else {
        this.current.pivot.rotation[AXES[this.current.move.axis]] =
          this.current.move.dir * (Math.PI / 2) * ease(this.current.t);
      }
      return;
    }
    const next = this.queue.shift();
    if (next) {
      this.startMove(next, (this.phase === 'scramble' ? 0.22 : 0.34) / s.speed);
      return;
    }
    this.phaseTime += dt;
    if (this.phase === 'scramble') {
      this.phase = 'pause';
      this.phaseTime = 0;
    } else if (this.phase === 'pause' && this.phaseTime > 0.5 / s.speed) {
      this.queue = this.history.map(move => ({ ...move, dir: (move.dir * -1) as 1 | -1 })).reverse();
      this.phase = 'solve';
    } else if (this.phase === 'solve') {
      this.phase = 'hold';
      this.phaseTime = 0;
    } else if (this.phase === 'hold') {
      const ready = s.trigger === 'loop' ? this.phaseTime > 2.4 / s.speed : this.clickPending;
      if (ready && s.trigger !== 'static' && !this.reducedMotion) {
        this.clickPending = false;
        this.scramble();
      }
    }
  }
  private onMove = (event: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    this.pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    this.pointer.inside = true;
  };
  private onDown = (event: PointerEvent) => {
    this.onMove(event);
    if (this.settings.trigger === 'click' && this.phase === 'hold') {
      this.clickPending = true;
    }
  };
  private onLeave = () => {
    this.pointer.inside = false;
  };
  private resize = () => {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.position.set(0, 0, 21 / Math.min(1, this.camera.aspect));
    this.camera.updateProjectionMatrix();
  };
  private frame = () => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.step(dt);
    const faceFront = this.phase === 'hold' || (this.phase === 'solve' && this.queue.length <= 1);
    const sway = this.pointer.inside ? 1 : 0;
    const targetX = faceFront ? this.pointer.y * 0.18 * sway : 0.42;
    const targetY = faceFront ? this.pointer.x * 0.28 * sway : -0.55;
    const k = 1 - Math.exp(-dt * 3);
    this.tilt.x += (targetX - this.tilt.x) * k;
    this.tilt.y += (targetY - this.tilt.y) * k;
    this.root.rotation.set(this.tilt.x, this.tilt.y, 0);
    this.renderer.render(this.scene, this.camera);
  };
}
