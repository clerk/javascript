import { UpdateUserParams } from '@clerk/types';

import { normalizeUnsafeMetadata } from './resourceParams';

describe('normalizeUnsafeMetadata', () => {
  it('handles unsafe_metadata', () => {
    const params: UpdateUserParams = {
      firstName: 'clerk',
      unsafeMetadata: {
        role: 'admin',
      },
    };

    const res = normalizeUnsafeMetadata(params);
    expect(res).toEqual({
      first_name: 'clerk',
      unsafe_metadata: JSON.stringify({
        role: 'admin',
      }),
    });
  });

  it('handles params without unsafe_metadata', () => {
    const params: UpdateUserParams = {
      firstName: 'clerk',
    };

    const res = normalizeUnsafeMetadata(params);
    expect(res).toEqual({
      first_name: 'clerk',
    });
  });

  it('handles undefined passed as params incorrectly', () => {
    const params = undefined;

    const res = normalizeUnsafeMetadata(params as any);
    expect(res).toEqual({});
  });

  it('handles unsafe_metadata passed as string', () => {
    const params: UpdateUserParams = {
      firstName: 'clerk',
      unsafeMetadata: JSON.stringify({
        role: 'admin',
      }) as any,
    };

    const res = normalizeUnsafeMetadata(params);
    expect(res).toEqual({
      first_name: 'clerk',
      unsafe_metadata: JSON.stringify({
        role: 'admin',
      }),
    });
  });
});
