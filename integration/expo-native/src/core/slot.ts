import { randomUUID } from 'node:crypto';
import { linkSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NAME = /^\d{12}$/;
const FREE = 'free';
const STALE_WRITER_WINDOW_MS = 60_000;

const nameOf = (gen: number) => String(gen).padStart(12, '0');

function generations(dir: string): number[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names.filter((n) => NAME.test(n)).map(Number).sort((a, b) => a - b);
}

export interface SlotState {
  readonly gen: number;
  readonly value: string | null;
}

export function readSlot(dir: string): SlotState {
  for (;;) {
    const gens = generations(dir);
    const gen = gens.at(-1);
    if (gen === undefined) return { gen: 0, value: null };
    try {
      const text = readFileSync(join(dir, nameOf(gen)), 'utf8');
      return { gen, value: text === FREE ? null : text };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}

function linkedIntoPrunedGap(gens: readonly number[], linked: number): boolean {
  return gens.some((g) => g > linked);
}

export function compareAndSwapSlot(dir: string, from: number, value: string | null): boolean {
  mkdirSync(dir, { recursive: true });
  const next = from + 1;
  const file = join(dir, nameOf(next));
  const staged = join(dir, `.${randomUUID()}`);
  writeFileSync(staged, value ?? FREE, { mode: 0o600 });
  try {
    linkSync(staged, file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  } finally {
    rmSync(staged, { force: true });
  }
  const gens = generations(dir);
  if (linkedIntoPrunedGap(gens, next)) {
    rmSync(file, { force: true });
    return false;
  }
  const cutoff = Date.now() - STALE_WRITER_WINDOW_MS;
  for (const g of gens) {
    if (g >= next - 1) continue;
    try {
      if (statSync(join(dir, nameOf(g))).mtimeMs < cutoff) rmSync(join(dir, nameOf(g)), { force: true });
    } catch {
      continue;
    }
  }
  return true;
}
