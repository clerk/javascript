import { NO_BUSY_WAIT, onceTheRunnerIsFree, type BusyWait } from './busy-runner.ts';
import type { Platform } from './types.ts';

export const COVERED = 'covered by another visible element';

export interface TapSettle {
  readonly timeoutMs: number;
  now(): number;
  wait(): Promise<unknown>;
}

export async function tapOnceUncovered(tap: () => Promise<void>, settle: TapSettle, busy: BusyWait = NO_BUSY_WAIT): Promise<void> {
  const deadline = settle.now() + settle.timeoutMs;
  for (;;) {
    try {
      return await onceTheRunnerIsFree(tap, busy);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes(COVERED) || settle.now() >= deadline) throw error;
      await settle.wait();
    }
  }
}

export type MarkTap = (target: { boundingBox(): Promise<{ readonly x: number; readonly y: number; readonly width: number; readonly height: number } | null> }, tap: () => Promise<void>) => Promise<void>;

export type Control = Parameters<MarkTap>[0] & { tap(options: { readonly timeout: number }): Promise<void> };

export function tapMarkedOnceUncovered(control: Control, markTap: MarkTap, settle: TapSettle, busy: BusyWait = NO_BUSY_WAIT): Promise<void> {
  return tapOnceUncovered(() => markTap(control, () => control.tap({ timeout: settle.timeoutMs })), settle, busy);
}

type Box = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

export function backControl<Found>(screen: { getByTestId(id: string): Found; getByLabel(label: string): Found }, platform: Platform): Found {
  return platform === 'ios' ? screen.getByTestId('BackButton') : screen.getByLabel('Back');
}

export function atItsMiddle(control: { boundingBox(): Promise<Box | null>; tap(options: { readonly timeout: number; readonly position: { readonly x: number; readonly y: number } }): Promise<void> }): Control {
  return {
    boundingBox: () => control.boundingBox(),
    async tap(options) {
      const box = await control.boundingBox();
      if (box === null) throw new Error('the back control has no box on screen');
      await control.tap({ ...options, position: { x: box.width / 2, y: box.height / 2 } });
    },
  };
}
