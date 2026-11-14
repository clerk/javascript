'use client';
import * as React from 'react';

import {
  buildUniforms,
  cubicBezier,
  MOSAIC_SOURCE,
  noiseHash,
  REVEAL,
  revealFront,
  SWAY,
  SWAY_FRAME_MS,
  TEXTURES,
} from '@/components/marketing/baked-mosaic';
import bake from '@/components/marketing/mosaic-bake.json';
import { FALLBACK_PALETTE, type Palette, readPalette } from '@/components/marketing/mosaic-shared';
import { Shader, type Uniforms } from '@/components/shader';
import type { Mode } from '@/components/use-mode';

function loopNoise(phase: number, steps: number, seed: number) {
  const t = (((phase % 1) + 1) % 1) * steps;
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  const a = noiseHash((i % steps) + seed) * f;
  const b = noiseHash(((i + 1) % steps) + seed) * (f - 1);
  return (a + (b - a) * u) * 2;
}

function loopSway(phase: number, steps: number, seed: number, detail: number) {
  return (loopNoise(phase, steps, seed) + detail * loopNoise(phase, steps * 2, seed + 31)) / (1 + detail);
}

const LOOP_OUT_MS = 900;
const LOOP_SHIMMER_MS = 900;
const LOOP_IN_MS = 1200;
const LOOP_EDGE_SOFTNESS = 2;
const LOOP_LEAD = 0.75;
const LOOP_SHIMMER_AMP: Record<Mode, number> = { dark: 0.08, light: 0.16 };

function loopUniforms(elapsed: number, loopMs: number, strength: number, mode: Mode, base: Uniforms): Uniforms {
  const film = (scale: number) => {
    const uniform = base.u_wave_film;
    return { type: 'uniform1f' as const, value: (uniform?.type === 'uniform1f' ? uniform.value : 0) * scale };
  };
  const wave = (progress: number, invert: number, scale: number): Uniforms => ({
    u_invert: { type: 'uniform1f', value: invert },
    u_reveal: { type: 'uniform1f', value: progress },
    u_front: { type: 'uniform1f', value: revealFront(progress) },
    u_shimmer_amp: { type: 'uniform1f', value: 0 },
    u_wave_film: film(scale),
    u_edge: { type: 'uniform1f', value: REVEAL.edge * LOOP_EDGE_SOFTNESS },
  });
  if (strength <= 0) {
    return wave(1, 0, 0);
  }
  const lead = Math.max(0, loopMs - LOOP_OUT_MS - LOOP_SHIMMER_MS - LOOP_IN_MS) * LOOP_LEAD;
  const out = (elapsed - lead) / LOOP_OUT_MS;
  if (out < 0) {
    return wave(1, 0, 0);
  }
  if (out < 1) {
    return wave(out, 1, strength * 0.5);
  }
  const shimmer = (elapsed - lead - LOOP_OUT_MS) / LOOP_SHIMMER_MS;
  if (shimmer < 1) {
    return {
      ...wave(1, 1, 0),
      u_shimmer: { type: 'uniform1f', value: cubicBezier(0.45, 0, 0.55, 1, shimmer) },
      u_shimmer_amp: { type: 'uniform1f', value: LOOP_SHIMMER_AMP[mode] },
    };
  }
  const back = (elapsed - lead - LOOP_OUT_MS - LOOP_SHIMMER_MS) / LOOP_IN_MS;
  return wave(Math.min(1, back), 0, strength);
}

export type MosaicFrameProps = {
  mode: Mode;
  focus: { x: number; y: number };
  scale: number;
  sceneWidth: number;
  loopMs: number;
  swaySteps: number;
  swayGain?: number;
  ripple?: number;
  phaseRef?: React.RefObject<number | null>;
};

export function MosaicFrame({
  mode,
  focus,
  scale,
  sceneWidth,
  loopMs,
  swaySteps,
  swayGain = 1,
  ripple = 0,
  phaseRef,
}: MosaicFrameProps) {
  const settings = bake.settings as Record<string, number>;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [palette, setPalette] = React.useState<Palette | null>(null);
  React.useLayoutEffect(() => {
    const host = rootRef.current?.parentElement;
    setPalette((host && readPalette(mode, host)) ?? FALLBACK_PALETTE);
  }, [mode]);
  const origin: [number, number] = [focus.x + bake.offsetX * scale, focus.y + bake.offsetY * scale];
  const center: [number, number] = [focus.x, focus.y + settings.logoSize * settings.logoY * scale];
  const uniforms = React.useMemo(
    () => (palette ? buildUniforms(palette, mode, origin, center, sceneWidth, bake) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [palette, mode, origin[0], origin[1], center[0], center[1], sceneWidth],
  );
  const lastRef = React.useRef<number | null>(null);
  const liveUniforms = React.useCallback((): Uniforms => {
    const phase = phaseRef?.current ?? (performance.now() % loopMs) / loopMs;
    const dx = loopSway(phase, swaySteps, 0, SWAY.detail) * SWAY.x * swayGain;
    const dy = loopSway(phase, swaySteps, 57, SWAY.detail) * SWAY.y * swayGain;
    return {
      ...loopUniforms(phase * loopMs, loopMs, ripple, mode, uniforms),
      u_skeleton_color: { type: 'uniform3f', value: (palette ?? FALLBACK_PALETTE).tileLow },
      u_skeleton_fade: { type: 'uniform1f', value: 1 },
      u_light_x: { type: 'uniform1f', value: settings.lightX + dx },
      u_light_y: { type: 'uniform1f', value: settings.lightY + dy },
      u_sway_glint: { type: 'uniform1f', value: SWAY.glint * swayGain },
      u_sway_size: { type: 'uniform1f', value: SWAY.size },
    };
  }, [phaseRef, loopMs, swaySteps, swayGain, ripple, mode, uniforms, palette, settings.lightX, settings.lightY]);
  const shouldRender = React.useCallback(() => {
    const fixed = phaseRef?.current;
    if (fixed !== null && fixed !== undefined) {
      if (fixed === lastRef.current) {
        return false;
      }
      lastRef.current = fixed;
      return true;
    }
    const now = performance.now();
    if (now - (lastRef.current ?? 0) < SWAY_FRAME_MS) {
      return false;
    }
    lastRef.current = now;
    return true;
  }, [phaseRef]);
  const pixelRatio = React.useCallback(() => Math.round(Math.max(1, Math.min(window.devicePixelRatio || 1, 2))), []);
  return (
    <div
      ref={rootRef}
      aria-hidden='true'
      className='pointer-events-none absolute'
      style={{ left: origin[0], top: origin[1], width: bake.width * scale, height: bake.height * scale }}
    >
      {palette ? (
        <Shader
          source={MOSAIC_SOURCE}
          uniforms={uniforms}
          textures={TEXTURES.desktop}
          liveUniforms={liveUniforms}
          shouldRender={shouldRender}
          pixelRatio={pixelRatio}
          premultiplied
        />
      ) : null}
    </div>
  );
}
