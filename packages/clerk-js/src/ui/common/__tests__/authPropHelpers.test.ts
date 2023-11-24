import { normalizeRoutingOptions } from '../../../utils/authPropHelpers';

describe('auth prop helpers', () => {
  describe('normalizeRoutingOptions', () => {
    it("returns routing: 'path' if path was provided and no routing was provided", () => {
      expect(normalizeRoutingOptions({ path: 'test' })).toEqual({ routing: 'path', path: 'test' });
    });

    it('it throws an error when path is provided and routing strategy is not path', () => {
      expect(() => {
        normalizeRoutingOptions({ path: 'test', routing: 'hash' });
      }).toThrow('ClerkJS: Invalid routing strategy, path cannot be used in tandem with hash.');
      expect(() => {
        normalizeRoutingOptions({ path: 'test', routing: 'virtual' });
      }).toThrow('ClerkJS: Invalid routing strategy, path cannot be used in tandem with virtual.');
    });
  });
});
