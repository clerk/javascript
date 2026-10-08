import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, rmSync, truncateSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { sealEvidence } from '../src/core/evidence.ts';
import type { EvidencePath } from '../src/core/types.ts';
import { holdsJwt, protect, redact } from '../specs/support/secret.ts';

const part = (claims: object): string => Buffer.from(JSON.stringify(claims)).toString('base64url');
const newJwt = (): string => [part({ alg: 'RS256', typ: 'JWT' }), part({ sid: `sess_${randomBytes(4).toString('hex')}` }), randomBytes(32).toString('base64url')].join('.');
const NO_RECORD = {} as Parameters<typeof sealEvidence>[1];

function sealed(files: Readonly<Record<string, string | Buffer>>, secrets: readonly string[]): readonly string[] {
  const dir = mkdtempSync(join(tmpdir(), 'verify-secrets-')) as EvidencePath;
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return sealEvidence(dir, NO_RECORD, secrets).tainted.map((file) => file.slice(dir.length + 1));
}

describe('redact', () => {
  it('takes out a token shaped like a JWT though no one told it the value', () => {
    const jwt = newJwt();
    assert.equal(redact(`Cookie: __session=${jwt}; __client=${newJwt()}`), 'Cookie: __session=<redacted>; __client=<redacted>');
    assert.equal(redact(`"Authorization":"Bearer ${jwt}"`), '"Authorization":"Bearer <redacted>"');
  });

  it('takes out a JWT that has other text stuck to its front, and only the JWT', () => {
    const jwt = newJwt();
    assert.equal(redact(`?ticket%3D${jwt}&next=home`), '?ticket%3D<redacted>&next=home');
    assert.equal(redact(`${jwt}.${'x'.repeat(20)} ${jwt}`), `<redacted>.${'x'.repeat(20)} <redacted>`);
  });

  it('reads a megabyte of text that could be the start of a JWT at every place in less than a second', { timeout: 5_000 }, () => {
    const started = Date.now();
    const almost = 'eyJ'.repeat(350_000);
    assert.equal(redact(almost), almost);
    assert.equal(holdsJwt(Buffer.from(`${almost}.eyJ`)), false);
    assert.ok(Date.now() - started < 1_000, `${Date.now() - started} ms`);
  });

  it('takes out each JWT of one unbroken run of characters that holds two hundred thousand of them', { timeout: 30_000 }, () => {
    const jwt = newJwt();
    const many = Array.from({ length: 200_000 }, () => jwt);
    assert.equal(holdsJwt(Buffer.from(many.join('.'))), true);
    assert.equal(redact(many.join('.')), many.map(() => '<redacted>').join('.'));
  });

  it('leaves text alone that only looks a little like a JWT', () => {
    for (const text of ['eyJhbGciOiJSUzI1NiJ9', 'eyJhbGciOiJSUzI1NiJ9.notapayloadatall.signaturesignature', 'a.b.c', 'pk_test_ZmFrZS0xLmNsZXJrLmFjY291bnRzLmRldiQ', 'specs/golden/sign-up/complete.e2e.ts']) {
      assert.equal(redact(text), text);
    }
  });

  it('takes out the longer of two values first when one holds the other', () => {
    const inner = `inner-${randomBytes(8).toString('hex')}`;
    const outer = `outer-${inner}-end`;
    protect(inner);
    protect(outer);
    assert.equal(redact(`saw ${outer} and ${inner}`), 'saw <redacted> and <redacted>');
  });
});

describe('the seal check', () => {
  it('taints a file that holds a JWT, a value the CLI never held', () => {
    assert.deepEqual(sealed({ 'driver.log': `__session=${newJwt()}`, 'clean.log': 'eyJhbGciOiJSUzI1NiJ9 is half a header' }, []), ['driver.log']);
  });

  it('finds a JWT that starts near the end of one stretch of a large file and ends in the next', () => {
    const jwt = newJwt();
    const stretch = 8 * 1024 * 1024;
    for (const before of [stretch - 20, stretch - 64 * 1024 + 5, 2 * stretch - 64 * 1024 - 30]) {
      assert.equal(holdsJwt(Buffer.concat([Buffer.alloc(before, 0x20), Buffer.from(jwt)])), true, `a JWT ${before} bytes in`);
    }
    assert.equal(holdsJwt(Buffer.alloc(2 * stretch, 0x65)), false);
  });

  it('taints a file that spells a secret one quoted character at a time, as XCTest shows typed text', () => {
    const password = `${randomBytes(12).toString('hex')}Aa1!`;
    const typedLines = (quote: string): string => [...password].map((character, at) => `    t = ${at}.00s Type ${quote}${character}${quote} into "password" SecureTextField`).join('\n');
    assert.deepEqual(
      sealed({ 'single.log': typedLines("'"), 'double.log': typedLines('"'), 'escaped.log': typedLines('\\"'), 'other.log': typedLines("'").replaceAll(password[3]!, password[3] === 'z' ? 'y' : 'z'), 'none.log': "Type 'a' into a field" }, [password]),
      ['double.log', 'escaped.log', 'single.log'],
    );
  });

  it('does not seal a run when a file of it cannot be scanned, so the run has no run.json and nothing of it is uploaded', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-secrets-')) as EvidencePath;
    try {
      writeFileSync(join(dir, 'app.log'), 'nothing secret');
      writeFileSync(join(dir, 'too-large-to-read.log'), '');
      truncateSync(join(dir, 'too-large-to-read.log'), 2 ** 31);
      assert.throws(() => sealEvidence(dir, NO_RECORD, []), { code: 'ERR_FS_FILE_TOO_LARGE' });
      assert.equal(existsSync(join(dir, 'run.json')), false);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it('does not take a secret shorter than eight characters for a needle, whole or spelled', () => {
    assert.deepEqual(sealed({ 'short.log': "the code 424242 and 'A''a''1''!'" }, ['424242', 'Aa1!']), []);
  });
});
