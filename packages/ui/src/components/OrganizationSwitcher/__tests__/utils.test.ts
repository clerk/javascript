import { describe, expect, it } from 'vitest';

import { populateCacheRemoveItem, populateCacheUpdateItem } from '../utils';

const staleInfiniteCache = [
  {
    data: [
      { id: '1', foo: 'zoo' },
      {
        id: '2',
        foo: 'bar',
      },
    ],
    total_count: 2,
  },
];

describe('Populate infinite cache helpers', () => {
  it('populateCacheUpdateItem', () => {
    expect(populateCacheUpdateItem({ id: '2', foo: 'too' }, staleInfiniteCache)).toEqual([
      {
        data: [
          { id: '1', foo: 'zoo' },
          {
            id: '2',
            foo: 'too',
          },
        ],
        total_count: 2,
      },
    ]);
  });

  it('populateCacheRemoveItem', () => {
    expect(populateCacheRemoveItem({ id: '2', foo: 'too' }, staleInfiniteCache)).toEqual([
      {
        data: [{ id: '1', foo: 'zoo' }],
        total_count: 1,
      },
    ]);
  });
});
