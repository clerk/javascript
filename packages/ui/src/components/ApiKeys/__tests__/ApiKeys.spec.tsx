import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { APIKeys } from '../ApiKeys';

const { createFixtures } = bindCreateFixtures('APIKeys');

function createFakeAPIKey(params: { id: string; name: string; createdAt: Date }) {
  return {
    id: params.id,
    type: 'api_key',
    name: params.name,
    subject: 'user_123',
    createdAt: params.createdAt,
  };
}

describe('APIKeys', () => {
  it('displays spinner when loading', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { baseElement } = render(<APIKeys />, { wrapper });

    await waitFor(() => {
      const spinner = baseElement.querySelector('span[aria-live="polite"]');
      expect(spinner).toBeVisible();
    });
  });

  it('renders API keys when data is loaded', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.clerk.apiKeys.getAll = vi.fn().mockResolvedValue({
      data: [
        createFakeAPIKey({
          id: 'ak_123',
          name: 'Foo API Key',
          createdAt: new Date('2024-01-01'),
        }),
        createFakeAPIKey({
          id: 'ak_456',
          name: 'Bar API Key',
          createdAt: new Date('2024-02-01'),
        }),
      ],
      total_count: 2,
    });

    const { getByText } = render(<APIKeys />, { wrapper });

    await waitFor(() => {
      expect(getByText('Foo API Key')).toBeVisible();
      expect(getByText('Created Jan 1, 2024 • Never expires')).toBeVisible();

      expect(getByText('Bar API Key')).toBeVisible();
      expect(getByText('Created Feb 1, 2024 • Never expires')).toBeVisible();
    });
  });

  it('handles empty API keys list', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.clerk.apiKeys.getAll = vi.fn().mockResolvedValue({
      data: [],
      total_count: 0,
    });

    const { getByText } = render(<APIKeys />, { wrapper });

    await waitFor(() => {
      expect(getByText(/No API keys found/i)).toBeVisible();
    });
  });
});
