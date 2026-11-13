import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('ArtifactsAPI', () => {
  it('fetches the Poppy artifact and returns its data unchanged', async () => {
    const data = { arbitrary_key: 'value', nested: { another_key: [1, true, null] } };
    server.use(
      http.get('https://api.clerk.test/v1/artifacts/well-known-poppy', ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('Bearer sk_live_example');
        expect(new URL(request.url).search).toBe('');
        return HttpResponse.json({ object: 'artifact', data });
      }),
    );
    const { artifacts } = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'sk_live_example',
    });
    await expect(artifacts.getPoppyJson()).resolves.toEqual(data);
  });
});
