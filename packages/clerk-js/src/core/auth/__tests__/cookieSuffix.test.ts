jest.mock('@clerk/shared/keys', () => {
  return { getCookieSuffix: jest.fn() };
});
jest.mock('@clerk/shared/logger', () => {
  return { logger: { logOnce: jest.fn() } };
});
import { getCookieSuffix as getSharedCookieSuffix } from '@clerk/shared/keys';
import { logger } from '@clerk/shared/logger';

import { getCookieSuffix } from '../cookieSuffix';

describe('getCookieSuffix', () => {
  beforeEach(() => {
    (getSharedCookieSuffix as jest.Mock).mockRejectedValue(new Error('mocked error for insecure context'));
  });

  afterEach(() => {
    (getSharedCookieSuffix as jest.Mock).mockReset();
    (logger.logOnce as jest.Mock).mockReset();
  });

  describe('getCookieSuffix(publishableKey, subtle?)', () => {
    const cases: Array<[string, string]> = [
      ['pk_live_Y2xlcmsuY2xlcmsuZGV2JA', '1Z8AzTQD'],
      ['pk_test_Y2xlcmsuY2xlcmsuZGV2JA', 'QvfNY2dr'],
    ];

    test.each(cases)('given %p pk, returns %p cookie suffix', async (pk, expected) => {
      expect(await getCookieSuffix(pk)).toEqual(expected);
      expect(logger.logOnce).toHaveBeenCalledTimes(1);
    });

    test('omits special characters from the cookie suffix', async () => {
      const pk = 'pk_test_ZW5vdWdoLWFscGFjYS04Mi5jbGVyay5hY2NvdW50cy5sY2xjbGVyay5jb20k';
      expect(await getCookieSuffix(pk)).toEqual('jtYvyt_H');

      const pk2 = 'pk_test_eHh4eHh4LXhhYWFhYS1hYS5jbGVyay5hY2NvdW50cy5sY2xjbGVyay5jb20k';
      expect(await getCookieSuffix(pk2)).toEqual('tZJdb-5s');

      expect(logger.logOnce).toHaveBeenCalledTimes(2);
    });
  });
});
