import { buildErrorThrower } from '@clerk/shared/error';
import { isHttpOrHttps } from '@clerk/shared/proxy';
import type { DomainOrProxyUrl } from '@clerk/shared/types';

import { isNative } from './runtime';

export const errorThrower = buildErrorThrower({ packageName: PACKAGE_NAME });

function assert(condition: boolean, thrower: () => never): asserts condition {
  if (!condition) {
    thrower();
  }
}

export const assertValidProxyUrl = (proxyUrl: DomainOrProxyUrl['proxyUrl']) => {
  if (!proxyUrl) {
    return;
  }

  if (isNative()) {
    assert(typeof proxyUrl === 'string', () =>
      errorThrower.throw('`proxyUrl` must be a string in non-browser environments.'),
    );

    if (!isHttpOrHttps(proxyUrl)) {
      errorThrower.throw('`proxyUrl` must be an absolute URL in non-browser environments.');
    }
  }
};
