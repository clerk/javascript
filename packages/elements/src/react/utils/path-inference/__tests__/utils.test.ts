import { removeOptionalCatchAllSegment } from '../utils';

describe('removeOptionalCatchAllSegment', () => {
  it('should remove optional catch-all segment from the pathname', () => {
    const pathname = '/users/[[...slug]].js';
    const expected = '/users';
    expect(removeOptionalCatchAllSegment(pathname)).toEqual(expected);
  });

  it('should not remove anything if there is no optional catch-all segment', () => {
    const pathname = '/users/john/profile';
    expect(removeOptionalCatchAllSegment(pathname)).toEqual(pathname);
  });
});
