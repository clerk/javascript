import { randomUUID } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { currentProcess, isRunning, type ProcessRef } from './exec.ts';
import { compareAndSwapSlot, readSlot } from './slot.ts';
import type { DeviceName, Platform } from './types.ts';

export interface Claim {
  readonly platform: Platform;
  readonly slot: number;
  readonly gen: number;
  readonly nonce: string;
  readonly deviceName: DeviceName;
  readonly worktree: string;
  readonly owner: ProcessRef;
  readonly reaping: boolean;
  readonly createdAt: string;
}

export const defaultClaimsDir = (): string => join(homedir(), '.verify', 'claims');

const slotDir = (dir: string, platform: Platform, slot: number) => join(dir, `${platform}-${slot}`);

export function readClaim(dir: string, platform: Platform, slot: number): { readonly gen: number; readonly claim: Claim | null } {
  const state = readSlot(slotDir(dir, platform, slot));
  return { gen: state.gen, claim: state.value === null ? null : { ...(JSON.parse(state.value) as Omit<Claim, 'gen'>), gen: state.gen } };
}

export function readClaims(dir: string, platform: Platform): readonly Claim[] {
  if (!existsSync(dir)) return [];
  const slots = readdirSync(dir).flatMap((name) => {
    const match = new RegExp(`^${platform}-(\\d+)$`).exec(name);
    return match === null ? [] : [Number(match[1])];
  });
  return slots.flatMap((slot) => {
    const { claim } = readClaim(dir, platform, slot);
    return claim === null ? [] : [claim];
  });
}

export function takeSlot(dir: string, platform: Platform, slot: number, from: number, worktree: string, reaping = false): Claim | null {
  const claim: Omit<Claim, 'gen'> = {
    platform,
    slot,
    nonce: randomUUID(),
    deviceName: `verify-${platform}-${slot}`,
    worktree,
    owner: currentProcess(),
    reaping,
    createdAt: new Date().toISOString(),
  };
  return compareAndSwapSlot(slotDir(dir, platform, slot), from, JSON.stringify(claim)) ? { ...claim, gen: from + 1 } : null;
}

export function freeSlot(dir: string, claim: Claim): boolean {
  return compareAndSwapSlot(slotDir(dir, claim.platform, claim.slot), claim.gen, null);
}

export function isOrphaned(claim: Claim): boolean {
  if (claim.reaping) return !isRunning(claim.owner);
  return !existsSync(claim.worktree) && !isRunning(claim.owner);
}
