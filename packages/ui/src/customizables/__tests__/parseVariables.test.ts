import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock cssSupports
vi.mock('../../utils/cssSupports', () => ({
  cssSupports: {
    modernColor: vi.fn(),
  },
}));

import { cssSupports } from '@/ui/utils/cssSupports';

import { removeInvalidValues } from '../parseVariables';

const mockModernColorSupport = vi.mocked(cssSupports.modernColor);

describe('removeInvalidValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModernColorSupport.mockReturnValue(false);
  });

  it('should return the variables as-is if modern color support is present', () => {
    mockModernColorSupport.mockReturnValue(true);
    const variables = {
      colorPrimary: 'var(--color-primary)',
    };

    const result = removeInvalidValues(variables);
    expect(result).toEqual({ colorPrimary: 'var(--color-primary)' });
  });

  it('should remove invalid string values if modern color support is not present', () => {
    mockModernColorSupport.mockReturnValue(false);
    const variables = {
      colorPrimary: 'var(--color-primary)',
      colorDanger: '#ff0000',
    };

    const result = removeInvalidValues(variables);
    expect(result).toEqual({ colorDanger: '#ff0000' });
  });

  it('should remove invalid object values if modern color support is not present', () => {
    mockModernColorSupport.mockReturnValue(false);
    const variables = {
      colorPrimary: {
        400: 'var(--color-primary-500)',
        500: '#fff',
      },
      colorDanger: {
        500: '#ff0000',
      },
    };

    const result = removeInvalidValues(variables);
    expect(result).toEqual({ colorDanger: { 500: '#ff0000' } });
  });
});
