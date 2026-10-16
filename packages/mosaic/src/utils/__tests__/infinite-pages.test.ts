import { describe, expect, it } from 'vitest';

import { replaceInPages, shrinkTotal } from '../infinite-pages';

describe('replaceInPages', () => {
  const page = (...ids: string[]) => ({ data: ids.map(id => ({ id, status: 'pending' })), total_count: 3 });

  it('replaces the item sharing its id, wherever its page is', () => {
    const accepted = { id: 'b', status: 'accepted' };

    expect(replaceInPages([page('a'), page('b', 'c')], accepted)).toEqual([
      page('a'),
      {
        data: [
          { id: 'b', status: 'accepted' },
          { id: 'c', status: 'pending' },
        ],
        total_count: 3,
      },
    ]);
  });

  it('keeps a page that has yet to load where it is', () => {
    expect(replaceInPages([undefined, page('a')], { id: 'a', status: 'accepted' })).toEqual([
      undefined,
      { data: [{ id: 'a', status: 'accepted' }], total_count: 3 },
    ]);
  });

  it('leaves the pages as they are when no item shares its id', () => {
    expect(replaceInPages([page('a')], { id: 'z', status: 'accepted' })).toEqual([page('a')]);
  });
});

describe('shrinkTotal', () => {
  const page = (total_count: number) => ({ data: [{ id: 'a' }], total_count });

  it('counts one fewer on every loaded page', () => {
    expect(shrinkTotal([page(12), undefined, page(12)])).toEqual([page(11), undefined, page(11)]);
  });
});
