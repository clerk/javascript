import { normalizeRoutingOptions } from '../authPropHelpers';

describe('auth prop helpers', () => {
  describe('normalizeRoutingOptions', () => {
    it("returns routing: 'path' if path was provided and no routing was provided", () => {
      expect(normalizeRoutingOptions({ path: 'test' })).toEqual({ routing: 'path', path: 'test' });
    });

    it('returns the same options if routing was provided (any routing) and path was provided', () => {
      expect(normalizeRoutingOptions({ routing: 'path', path: 'test' })).toEqual({ routing: 'path', path: 'test' });
      expect(normalizeRoutingOptions({ routing: 'hash', path: 'test' })).toEqual({ routing: 'hash', path: 'test' });
      expect(normalizeRoutingOptions({ routing: 'virtual' })).toEqual({ routing: 'virtual' });
    });
  });
});
