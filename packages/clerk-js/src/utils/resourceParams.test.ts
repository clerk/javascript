import { normalizeUnsafeMetadata } from './resourceParams';
import { UpdateUserParams } from '@clerk/types';

describe('normalizeUnsafeMetadata', () => {
  it('handles unsafe_metadata', () => {
    const params: UpdateUserParams = {
      first_name: 'clerk',
      unsafe_metadata: {
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
      first_name: 'clerk',
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
      first_name: 'clerk',
      unsafe_metadata: JSON.stringify({
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
