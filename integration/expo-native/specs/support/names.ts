import { createHash } from 'node:crypto';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { RunId } from './types.ts';

export const PEOPLE = [
  'ada', 'ben', 'cleo', 'dora', 'eli', 'finn', 'gus', 'hana', 'ivy', 'jade',
  'kai', 'leo', 'maya', 'nora', 'omar', 'pia', 'quin', 'rosa', 'sam', 'tara',
  'uma', 'vera', 'wade', 'xena', 'yara', 'zoe', 'abe', 'bea', 'cole', 'dana',
  'emma', 'fay', 'gil', 'hugo', 'iris', 'joel', 'kim', 'lane', 'mila', 'ned',
] as const;

export const ORGANIZATIONS = [
  'Acme', 'Atlas', 'Beacon', 'Birch', 'Cedar', 'Copper', 'Delta', 'Ember',
  'Falcon', 'Forge', 'Granite', 'Harbor', 'Juniper', 'Maple', 'Meadow', 'Orchid',
  'Pioneer', 'Quartz', 'Raven', 'Sierra', 'Summit', 'Tundra', 'Vista', 'Willow',
] as const;

export const PASSWORD_WORDS = [
  'Otter', 'Lamp', 'Cove', 'Pine', 'Kite', 'Moss', 'Fern', 'Dune',
  'Reef', 'Wren', 'Lark', 'Opal', 'Ruby', 'Plum', 'Sage', 'Tide',
  'Bolt', 'Cliff', 'Drum', 'Fox', 'Gem', 'Hive', 'Iron', 'Jet',
  'Knot', 'Loom', 'Mint', 'Nest', 'Oak', 'Pond', 'Quill', 'Rope',
] as const;

export type NameKind = 'person' | 'organization';

const TABLES: Readonly<Record<NameKind, readonly string[]>> = { person: PEOPLE, organization: ORGANIZATIONS };

export interface RunNames {
  claim(kind: NameKind): string;
}

const firstWordOf = (run: RunId): number => createHash('sha256').update(run).digest().readUInt32BE(0);

function wordAt(table: readonly string[], start: number, index: number): string {
  const word = table[(start + index) % table.length]!;
  return index < table.length ? word : `${word}${Math.floor(index / table.length) + 1}`;
}

function claimed(path: string): boolean {
  try {
    closeSync(openSync(path, 'wx'));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  }
}

export function runNames(run: RunId, dir: string = join(tmpdir(), 'clerk-e2e-names', run)): RunNames {
  const start = firstWordOf(run);
  return {
    claim(kind) {
      mkdirSync(dir, { recursive: true });
      let index = 0;
      while (!claimed(join(dir, `${kind}-${index}`))) index += 1;
      return wordAt(TABLES[kind], start, index);
    },
  };
}
