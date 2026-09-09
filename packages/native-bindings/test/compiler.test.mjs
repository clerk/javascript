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

test('discriminated unions expose common string fields without duplicating variant policy', () => {
  const model = compile(
    source.replace(
      'id: string;',
      "id: string; factor: { strategy: 'email_code'; address: string } | { strategy: 'phone_code'; number: string };",
    ),
  );
  assert.deepEqual(model.failures, []);
  const native = generateNative(model, { protocolVersion: 1, contractHash: 'fixture' });
  assert.match(native['GeneratedAPI.swift'], /public var `strategy`: String/);
  assert.match(native['GeneratedAPI.kt'], /public val `strategy`: String/);
  assert.match(native['swift-api.txt'], /strategy: String \[shared union field\]/);
});

test('explicit resource property reads retain source types without broadcasting values', () => {
  const model = compile(source.replace('id: string;', 'id: string; backupCodes?: string[];'), {
    explicitReads: { 'SignInFutureResource.backupCodes': 'Return sensitive values to the caller only.' },
  });
  assert.deepEqual(model.failures, []);
  assert.equal(
    model.definitions.SignIn.properties.some(p => p.name === 'backupCodes'),
    false,
  );
  const read = model.definitions.SignIn.methods.find(m => m.name === 'backupCodes');
  assert.equal(read.invocation, 'readProperty');
  assert.deepEqual(read.parameters, []);
  const native = generateNative(model, { protocolVersion: 1, contractHash: 'fixture' });
  assert.match(native['GeneratedAPI.swift'], /func `backupCodes`\(\) async throws -> \[String\]\?/);
  assert.match(native['GeneratedAPI.kt'], /suspend fun `backupCodes`\(\): List<String>\?/);
  const wrongKind = compile(source, { explicitReads: { 'SignInFutureResource.reload': 'Invalid target.' } });
  assert.ok(wrongKind.failures.some(f => /data property on a resource/.test(f.reason)));
});

test('mapped dictionaries preserve finite keys, optional values, and custom provider patterns', () => {
  const model = compile(
    source.replace(
      'id: string;',
      'id: string; providers: Partial<{ [key in "oauth_google" | "oauth_apple" | `oauth_custom_${string}`]: Provider }>;',
    ) + 'interface Provider { name: string; enabled: boolean; }',
  );
  assert.deepEqual(model.failures, []);
  const shape = model.definitions.SignIn.properties.find(p => p.name === 'providers').type;
  assert.equal(shape.kind, 'dictionary');
  assert.deepEqual(shape.keys.values.sort(), ['oauth_apple', 'oauth_google']);
  assert.deepEqual(shape.keys.patterns, ['^oauth_custom_.*$']);
  assert.deepEqual(shape.requiredKeys, []);
  assert.equal(shape.value.kind, 'optional');
  const native = generateNative(model, { protocolVersion: 1, contractHash: 'fixture' });
  assert.match(native['GeneratedAPI.swift'], /\[String: Provider\?\]/);
  assert.match(native['GeneratedAPI.kt'], /Map<String, Provider\?>/);
});

test('unsupported pattern indices fail instead of disappearing from named objects', () => {
  const model = compile(
    source.replace('id: string;', 'id: string; providers: { primary: string; [key: `custom_${string}`]: number };'),
  );
  assert.ok(model.failures.some(f => /Pattern or numeric index/.test(f.reason)));
});

test('utility-type parameters keep their exported contract alias', () => {
  const model = compile(
    source.replace('params: VerifyParams', 'params: UpdatePasskeyParams') +
      'export type UpdatePasskeyParams = Partial<{ name: string | null }>;',
  );
  assert.deepEqual(model.failures, []);
  const native = generateNative(model, { protocolVersion: 1, contractHash: 'fixture' });
  assert.match(native['GeneratedAPI.swift'], /struct UpdatePasskeyParams/);
  assert.match(native['GeneratedAPI.kt'], /class UpdatePasskeyParams/);
  assert.doesNotMatch(native['GeneratedAPI.swift'], /Partialtype/);
});

test('a sparse dictionary adapter retains value types and checks the targeted member', () => {
  const model = compile(source.replace('attributes: Record<string, string>', 'attributes: Record<"a" | "b", string>'), {
    sparseDictionaries: { 'SignInFutureResource.attributes': 'Only configured keys are returned.' },
  });
  assert.deepEqual(model.failures, []);
  const shape = model.definitions.SignIn.properties.find(p => p.name === 'attributes').type;
  assert.deepEqual(shape.requiredKeys, []);
  assert.deepEqual(shape.value, { kind: 'string' });
  assert.ok(compile(source, { sparseDictionaries: { 'SignInFutureResource.id': 'Wrong shape.' } }).failures.length);
  assert.ok(
    compile(source, { sparseDictionaries: { 'SignInFutureResource.missing': 'Stale policy.' } }).failures.length,
  );
});
