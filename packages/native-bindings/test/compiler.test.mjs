import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileProfile } from '../src/compiler.mjs';
import { generateNative } from '../src/native.mjs';

function compile(source, changes = {}) {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-bindings-'));
  const shared = path.join(repository, 'packages/shared');
  fs.mkdirSync(path.join(shared, 'src/types'), { recursive: true });
  fs.mkdirSync(path.join(shared, 'src/errors'), { recursive: true });
  fs.writeFileSync(
    path.join(shared, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { strict: true, target: 'es2022' }, include: ['src'] }),
  );
  fs.writeFileSync(
    path.join(shared, 'src/errors/clerkError.ts'),
    'export class ClerkError extends Error { readonly clerkError = true; readonly code = "test"; }',
  );
  fs.writeFileSync(
    path.join(shared, 'src/types/fixture.ts'),
    `import type { ClerkError } from '../errors/clerkError';\n${source}`,
  );
  try {
    return compileProfile(repository, {
      version: 1,
      jsonObjects: [],
      roots: { signIn: ['fixture.ts', 'SignInFutureResource'] },
      excluded: {},
      adapted: {},
      ...changes,
    });
  } finally {
    fs.rmSync(repository, { recursive: true, force: true });
  }
}

const source = `
interface Reloadable { reload(): Promise<this>; }
export interface SignInFutureResource extends Reloadable {
  id: string;
  status: 'initial' | 'complete';
  displayName?: string | null;
  emailCode: { verifyCode(params: VerifyParams): Promise<{ error: ClerkError | null }> };
  attributes: Record<string, string>;
}
export interface VerifyParams { code: string; }
`;

test('derives nested methods, inherited this, and nullable presence from TypeScript', () => {
  const model = compile(source);
  assert.deepEqual(model.failures, []);
  const group = model.definitions.SignInEmailCode;
  assert.equal(group.methods[0].name, 'verifyCode');
  assert.equal(group.methods[0].errorResult, true);
  assert.deepEqual(model.definitions.SignIn.methods[0].result, { kind: 'ref', name: 'SignIn' });
  const presence = model.definitions.SignIn.properties.find(p => p.name === 'displayName').type;
  assert.equal(presence.nullable, true);
  assert.equal(presence.omittable, true);
  const native = generateNative(model, { protocolVersion: 1, contractHash: 'fixture' });
  assert.match(native['GeneratedAPI.swift'], /func `verifyCode`\(_ `params`: VerifyParams\) async throws/);
  assert.match(native['GeneratedAPI.kt'], /suspend fun `verifyCode`\(`params`: VerifyParams\): Unit/);
  assert.match(native['GeneratedAPI.swift'], /Field<String>/);
});

test('a TypeScript signature change changes both native APIs without a method catalog', () => {
  const before = generateNative(compile(source), { protocolVersion: 1, contractHash: 'fixture' });
  const after = generateNative(compile(source.replace('code: string;', 'code: string; attemptId: string;')), {
    protocolVersion: 1,
    contractHash: 'fixture',
  });
  for (const language of ['GeneratedAPI.swift', 'GeneratedAPI.kt']) {
    assert.notEqual(before[language], after[language]);
    assert.match(after[language], /attemptId/);
  }
});

test('unknown, callbacks, overloads, naming collisions, and stale policies fail explicitly', () => {
  for (const field of ['bad: unknown;', 'bad: Record<string, unknown>;', 'bad: () => void;']) {
    const model = compile(source.replace('code: string;', `code: string; ${field}`));
    assert.ok(model.failures.length, field);
  }
  const overload = compile(
    source.replace('reload(): Promise<this>;', 'reload(): Promise<this>; reload(force: boolean): Promise<this>;'),
  );
  assert.ok(overload.failures.some(f => /Overloaded/.test(f.reason)));
  const collision = compile(source + 'export interface SignIn { other: string };', {
    roots: { signIn: ['fixture.ts', 'SignInFutureResource'], other: ['fixture.ts', 'SignIn'] },
  });
  assert.ok(collision.failures.some(f => /collision/.test(f.reason)));
  assert.ok(
    compile(source, { excluded: { 'SignInFutureResource.missing': 'test' } }).failures.some(f =>
      /not reached/.test(f.reason),
    ),
  );
});

test('legacy auth edges and a different error envelope are rejected', () => {
  const legacy = compile(
    source.replace('id: string;', 'id: string; legacy: SignInResource;') + 'interface SignInResource { id: string; }',
  );
  assert.ok(legacy.failures.some(f => /Legacy authentication/.test(f.reason)));
  const badError = compile(source.replace('error: ClerkError | null', 'error: string | null'));
  assert.ok(badError.failures.some(f => /canonical ClerkError/.test(f.reason)));
});

test('only an explicit field policy permits arbitrary JSON metadata', () => {
  const model = compile(source.replace('attributes: Record<string, string>', 'attributes: Record<string, unknown>'), {
    jsonMembers: { 'SignInFutureResource.attributes': 'User metadata.' },
  });
  assert.deepEqual(model.failures, []);
  assert.equal(model.definitions.SignIn.properties.find(p => p.name === 'attributes').type.value.kind, 'json');
});
