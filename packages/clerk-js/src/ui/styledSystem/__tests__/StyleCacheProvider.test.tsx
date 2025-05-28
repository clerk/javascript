// eslint-disable-next-line no-restricted-imports
import type { StylisElement } from '@emotion/cache';

import { wrapInLayer } from '../StyleCacheProvider';

// Mock the StylisPlugin type
type MockStylisElement = Partial<StylisElement> & {
  type: string;
  props: string[];
  children: MockStylisElement[];
  parent: MockStylisElement | null;
  root: MockStylisElement | null;
  length: number;
  value: string;
  return: string;
  line: number;
  column: number;
};

describe('wrapInLayer', () => {
  it('wraps CSS rules in a CSS layer', () => {
    const node: MockStylisElement = {
      type: 'rule',
      props: ['body'],
      children: [],
      parent: null,
      root: null,
      length: 0,
      value: '',
      return: '',
      line: 1,
      column: 1,
    };

    const plugin = wrapInLayer('test-layer');
    // @ts-expect-error - We're mocking the StylisPlugin type
    plugin(node);

    expect(node.type).toBe('@layer');
    expect(node.props).toEqual(['test-layer']);
    expect(node.children).toHaveLength(1);
    const child = node.children[0];
    expect(child.props).toEqual(['body']);
  });

  it('does not wrap if node has a parent', () => {
    const node: MockStylisElement = {
      type: 'rule',
      props: ['body'],
      children: [],
      parent: { type: 'parent' } as MockStylisElement,
      root: null,
      length: 0,
      value: '',
      return: '',
      line: 1,
      column: 1,
    };

    const originalNode = { ...node };
    const plugin = wrapInLayer('test-layer');
    // @ts-expect-error - We're mocking the StylisPlugin type
    plugin(node);

    expect(node).toEqual(originalNode);
  });
});
