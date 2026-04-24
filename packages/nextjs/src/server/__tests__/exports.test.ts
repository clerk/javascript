import { describe, expect, it } from 'vitest';

import * as publicExports from '../index';
import * as rscExports from '../index.rsc';

describe('/server public exports', () => {
  describe('default condition (pages-safe)', () => {
    it('should not include a breaking change', () => {
      expect(Object.keys(publicExports).sort()).toMatchSnapshot();
    });
  });

  describe('react-server condition', () => {
    it('should not include a breaking change', () => {
      expect(Object.keys(rscExports).sort()).toMatchSnapshot();
    });
  });
});
