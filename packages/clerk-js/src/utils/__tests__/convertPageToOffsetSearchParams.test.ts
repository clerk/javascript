import { expect, it } from 'vitest';

import { convertPageToOffsetSearchParams } from '../convertPageToOffsetSearchParams';

it('omits empty filters while preserving nonempty filters and pagination', () => {
  const params = convertPageToOffsetSearchParams({
    initialPage: 3,
    pageSize: 10,
    status: [],
    role: ['org:admin', 'org:member'],
    query: '',
    enabled: false,
    absent: undefined,
  });

  expect(Object.fromEntries(params)).toEqual({
    role: 'org:admin,org:member',
    query: '',
    enabled: 'false',
    limit: '10',
    offset: '20',
  });
});
