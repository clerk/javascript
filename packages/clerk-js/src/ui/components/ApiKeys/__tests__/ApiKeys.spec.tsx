import { describe, expect, it, vi } from 'vitest';

import { render, waitFor } from '../../../../vitestUtils';
import { bindCreateFixtures } from '../../../utils/vitest/createFixtures';
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

  it('displays pagination when there are more items than per page', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.clerk.apiKeys.getAll = vi.fn().mockResolvedValue({
      data: Array.from({ length: 10 }, (_, i) =>
        createFakeAPIKey({
          id: `ak_${i}`,
          name: `API Key ${i}`,
          createdAt: new Date('2024-01-01'),
        }),
      ),
      total_count: 10,
    });

    const { getByText } = render(<APIKeys />, { wrapper });

    await waitFor(() => {
      expect(
        getByText((_, element) => {
          return element?.textContent === 'Displaying 1 – 5 of 10';
        }),
      ).toBeVisible();
    });
  });

  it('does not display pagination when items fit in one page', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.clerk.apiKeys.getAll = vi.fn().mockResolvedValue({
      data: [
        createFakeAPIKey({
          id: 'ak_123',
          name: 'Test API Key',
          createdAt: new Date('2024-01-01'),
        }),
      ],
      total_count: 1,
    });

    const { queryByText } = render(<APIKeys />, { wrapper });

    await waitFor(() => {
      expect(
        queryByText((_, element) => {
          return element?.textContent === 'Displaying 1 – 1 of 1';
        }),
      ).not.toBeInTheDocument();
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
