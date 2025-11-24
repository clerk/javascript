import type { UpdateUserParams } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { normalizeUnsafeMetadata } from '../resourceParams';

describe('normalizeUnsafeMetadata', () => {
  it('handles unsafeMetadata', () => {
    const params: UpdateUserParams = {
      firstName: 'clerk',
      unsafeMetadata: {
        role: 'admin',
      },
    };

    const res = normalizeUnsafeMetadata(params);
    expect(res).toEqual({
      firstName: 'clerk',
      unsafeMetadata: JSON.stringify({
        role: 'admin',
      }),
    });
  });

  it('handles params without unsafeMetadata', () => {
    const params: UpdateUserParams = {
      firstName: 'clerk',
    };

    const res = normalizeUnsafeMetadata(params);
    expect(res).toEqual({
      firstName: 'clerk',
    });
  });

  it('handles undefined passed as params incorrectly', () => {
    const params = undefined;

    const res = normalizeUnsafeMetadata(params as any);
    expect(res).toEqual({});
  });

  it('handles unsafeMetadata passed as string', () => {
    const params: UpdateUserParams = {
      firstName: 'clerk',
      unsafeMetadata: JSON.stringify({
        role: 'admin',
      }) as any,
    };

    const res = normalizeUnsafeMetadata(params);
    expect(res).toEqual({
      firstName: 'clerk',
      unsafeMetadata: JSON.stringify({
        role: 'admin',
      }),
    });
  });
});
