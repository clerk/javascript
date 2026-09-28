import { describe, expect, it } from 'vitest';

import { readJSONFile } from '../file';

describe('readJSONFile', () => {
  it('resolves with the parsed contents', async () => {
    const file = new File(['{"type":"service_account"}'], 'key.json', { type: 'application/json' });

    await expect(readJSONFile(file)).resolves.toEqual({ type: 'service_account' });
  });

  it('rejects a file that is not JSON', async () => {
    const file = new File(['not json'], 'key.json', { type: 'application/json' });

    await expect(readJSONFile(file)).rejects.toThrow(SyntaxError);
  });
});
