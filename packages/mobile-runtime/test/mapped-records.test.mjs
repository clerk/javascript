import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decode, encode } from '../src/codec.ts';

const required = {
  kind: 'dictionary',
  value: { kind: 'string' },
  keys: { values: ['email', 'phone'], patterns: [], open: false },
  requiredKeys: ['email', 'phone'],
};
const partial = {
  kind: 'dictionary',
  value: { kind: 'optional', omittable: true, nullable: false, value: { kind: 'boolean' } },
  keys: { values: ['oauth_google'], patterns: ['^oauth_custom_.*$'], open: false },
  requiredKeys: [],
};

test('mapped record inputs validate required keys and declared custom key patterns', () => {
  assert.deepEqual(decode(required, { email: 'a', phone: 'b' }, {}), { email: 'a', phone: 'b' });
  assert.throws(() => decode(required, { email: 'a' }, {}));
  assert.throws(() => decode(required, { email: 'a', phone: 'b', other: 'c' }, {}));
  assert.throws(() => decode(partial, { password: true }, {}));
  assert.throws(() => decode(partial, { oauth_custom_test: 'wrong' }, {}));
  const value = { oauth_google: undefined, oauth_custom_test: true };
  assert.deepEqual(decode(partial, encode(partial, value, {}), {}), value);
  assert.deepEqual(decode(partial, {}, {}), {});
});

test('mapped record outputs preserve new server keys while checking their values', () => {
  assert.deepEqual(encode(partial, { oauth_future: true }, {}), { oauth_future: true });
  assert.throws(() => encode(partial, { oauth_future: 1 }, {}));
  assert.throws(() => encode(required, { email: 'a' }, {}));
});
