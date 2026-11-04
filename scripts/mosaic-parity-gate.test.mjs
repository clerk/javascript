import { describe, expect, test } from 'vitest';

import { auditProblem, createdFiles, inventoryProblem } from './mosaic-parity-gate.mjs';

const root = '/repo';
const legacy = ['packages/react/src/components/SignOutButton.tsx'];

describe('createdFiles', () => {
  test('reads a Claude Write of a new file', () => {
    const input = { tool_input: { file_path: '/repo/packages/mosaic/src/features/x/x.model.ts' } };
    expect(createdFiles(input, root)).toEqual(['packages/mosaic/src/features/x/x.model.ts']);
  });

  test('reads every added file in a Codex apply_patch', () => {
    const command = [
      '*** Begin Patch',
      '*** Add File: packages/mosaic/src/features/x/x.model.ts',
      '+export {};',
      '*** Update File: packages/mosaic/src/localization/registry.ts',
      '*** Add File: /repo/packages/mosaic/src/features/x/x.view.tsx',
      '*** End Patch',
    ].join('\n');
    expect(createdFiles({ cwd: root, tool_input: { command } }, root)).toEqual([
      'packages/mosaic/src/features/x/x.model.ts',
      'packages/mosaic/src/features/x/x.view.tsx',
    ]);
  });
});

describe('inventoryProblem', () => {
  test('requires the proof file', () => {
    expect(inventoryProblem('', legacy)).toBe('missing');
  });

  test('requires the legacy path', () => {
    expect(inventoryProblem('## Inventory\n- redirectUrl defaults to /', legacy)).toMatch(/does not name/);
  });

  test('requires a non-empty inventory', () => {
    expect(inventoryProblem(`Legacy: ${legacy[0]}\n## Inventory\n\n## Parity audit\n`, legacy)).toMatch(/Inventory/);
  });

  test('passes a filled inventory', () => {
    expect(inventoryProblem(`Legacy: ${legacy[0]}\n## Inventory\n- redirectUrl defaults to /`, legacy)).toBeUndefined();
  });
});

describe('auditProblem', () => {
  test('requires a non-empty audit section', () => {
    expect(auditProblem('## Inventory\n- a\n## Parity audit\n')).toMatch(/Parity audit/);
  });

  test('passes a filled audit section', () => {
    expect(auditProblem('## Inventory\n- a\n## Parity audit\n| row | Migrated |')).toBeUndefined();
  });
});
