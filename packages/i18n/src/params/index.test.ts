import { describe, expect, it } from 'vitest';

import { params } from './index';

describe('params', () => {
  it('creates a params marker carrying the template', () => {
    expect(params('Hi {name}')).toEqual({ _type: 'params', template: 'Hi {name}' });
  });
});
