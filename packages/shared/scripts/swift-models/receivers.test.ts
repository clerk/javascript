import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { callableResources, validateNativeResourceRoutes } from './receivers';

function programWith(source: string): ts.Program {
  const filename = '/src/types/newResource.ts';
  const host = ts.createCompilerHost({ noLib: true });
  host.getSourceFile = name =>
    name === filename ? ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true) : undefined;
  return ts.createProgram([filename], { noLib: true }, host);
}

describe('native resource coverage', () => {
  it('fails generation when a new callable resource has no routing decision', () => {
    const program = programWith('export interface NewResource { revoke(): void }');
    expect(() => validateNativeResourceRoutes(program, [])).toThrow(
      'Native resource NewResource needs a route or an exclusion: revoke',
    );
  });

  it('discovers inherited and optional operations without mistaking snapshot reload for an independent API', () => {
    const program = programWith(`
      interface ClerkResource { reload(): void }
      interface SnapshotResource extends ClerkResource { id: string }
      interface CallableResource extends ClerkResource { accept?(): void }
      interface RefinedResource extends CallableResource { status: string }
    `);
    expect(Object.fromEntries(callableResources(program))).toEqual({
      CallableResource: ['accept'],
      RefinedResource: ['accept'],
    });
  });
});
