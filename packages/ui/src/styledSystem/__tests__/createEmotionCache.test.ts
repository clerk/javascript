import { logger } from '@clerk/shared/logger';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createEmotionCache } from '../createEmotionCache';

function insertAndRead(cssLayerName: string | undefined, styles: string) {
  const cache = createEmotionCache({ cssLayerName });
  const insert = vi.spyOn(cache.sheet, 'insert').mockImplementation(() => {});
  cache.insert('', { name: 'rule', styles, next: undefined } as any, cache.sheet, true);
  return insert.mock.calls.map(([rule]) => rule).join('');
}

describe('createEmotionCache', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['app.clerk', '--vendor', 'clérk'])('wraps insertions in the configured layer %s', name => {
    expect(insertAndRead(name, 'color:red;')).toContain(`@layer ${name}`);
  });

  it('drops a cssLayerName that would break out of the @layer rule', () => {
    vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const payload = 'x} body { filter: blur(2px) } /*';
    const emitted = insertAndRead(payload, 'color:red;');
    expect(emitted).not.toContain('@layer');
    expect(emitted).not.toContain('blur');
  });

  it('drops a cssLayerName carrying markup', () => {
    vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const emitted = insertAndRead('x{}</style><img src=x onerror=alert(1)><style>', 'color:red;');
    expect(emitted).not.toContain('</style>');
    expect(emitted).not.toContain('@layer');
  });
});
