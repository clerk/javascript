import assert from 'node:assert/strict';
import { test } from 'node:test';
import { encode } from '../src/codec.ts';

for (const open of [false, true]) {
  const shape = {
    kind: 'union',
    variants: [
      {
        kind: 'object',
        properties: [{ name: 'kind', type: { kind: 'enum', values: ['oauth'], patterns: ['^custom_.*$'], open } }],
      },
      {
        kind: 'object',
        properties: [
          { name: 'kind', type: { kind: 'literal', value: 'credential' } },
          { name: 'id', type: { kind: 'string' } },
          { name: 'status', type: { kind: 'enum', values: ['active'], patterns: [], open: false } },
        ],
      },
    ],
  };
  test(`recognized discriminants beat ${open ? 'open' : 'closed'} enum fallback without losing future field values`, () => {
    const value = { kind: 'credential', id: 'td_123', status: 'future_status' };
    assert.deepEqual(encode(shape, value, {}), { $case: 1, value });
    for (const kind of ['oauth', 'custom_provider', 'future_provider']) {
      assert.deepEqual(encode(shape, { kind }, {}), { $case: 0, value: { kind } });
    }
  });
  test(`malformed recognized discriminants cannot fall back to the ${open ? 'open' : 'closed'} enum branch`, () => {
    assert.throws(() => encode(shape, { kind: 'credential', id: 123, status: 'active' }, {}), /invalid_bridge_value/);
    assert.throws(() => encode(shape, { kind: 'credential' }, {}), /invalid_bridge_value/);
  });
}
