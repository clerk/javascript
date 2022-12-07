import { normalizeRoutingOptions } from '../authPropHelpers';

describe('auth prop helpers', () => {
  describe('normalizeRoutingOptions', () => {
    it("returns routing: 'path' if path was provided and no routing was provided", () => {
      expect(normalizeRoutingOptions({ path: 'test' })).toEqual({ routing: 'path', path: 'test' });
    });

    it('returns routing: null if path was provided and routing was null (avoid breaking integrations)', () => {
      //@ts-expect-error
      expect(normalizeRoutingOptions({ path: 'test', routing: null })).toEqual({ routing: null, path: 'test' });
    });

    it('returns the same options if routing was provided (any routing) and path was provided (avoid breaking integrations)', () => {
      expect(normalizeRoutingOptions({ routing: 'path', path: 'test' })).toEqual({ routing: 'path', path: 'test' });
      expect(normalizeRoutingOptions({ routing: 'hash', path: 'test' })).toEqual({ routing: 'hash', path: 'test' });
      expect(normalizeRoutingOptions({ routing: 'virtual' })).toEqual({ routing: 'virtual' });
    });
  });
});
