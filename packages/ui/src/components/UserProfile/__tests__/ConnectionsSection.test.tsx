import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { clearFetchCache } from '@/ui/hooks';

import { ConnectionsSection } from '../ConnectionsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const withUser = createFixtures.config(f => {
  f.withUser({});
});

const connector = { id: 'cnr_1', key: 'acme', displayName: 'Acme Tasks' };
const connection = {
  id: 'cnn_1',
  key: 'acme',
  connector: 'acme',
  status: 'active',
  providerAccount: { id: '1', label: 'pat@acme.example' },
};

const mockConnect = (fixtures: any, { connectors = [connector], connections = [] as unknown[] } = {}) => {
  clearFetchCache();
  const api = {
    connectors: { list: vi.fn().mockResolvedValue({ data: connectors, totalCount: connectors.length }) },
    connections: {
      list: vi.fn().mockResolvedValue({ data: connections, totalCount: connections.length }),
      connect: vi.fn(),
      reauthorize: vi.fn(),
      disconnect: vi.fn().mockResolvedValue({}),
    },
  };
  Object.defineProperty(fixtures.clerk, 'connect', { value: api, configurable: true });
  return api;
};

describe('ConnectionsSection', () => {
  it('names each service in the connect menu', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    mockConnect(fixtures);
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /connect service/i }));
    expect(await screen.findByText('Acme Tasks')).toBeInTheDocument();
  });

  it('asks for confirmation before it disconnects', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures, { connections: [connection] });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /disconnect/i }));
    expect(api.connections.disconnect).not.toHaveBeenCalled();

    await userEvent.click(await screen.findByRole('button', { name: /remove/i }));
    await waitFor(() => expect(api.connections.disconnect).toHaveBeenCalledWith('cnn_1'));
  });

  it('shows an error, not an empty list, when connections fail to load', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures);
    api.connections.list.mockRejectedValue(new Error('unavailable'));
    render(<ConnectionsSection />, { wrapper });

    expect(await screen.findByText(/could not be loaded/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /connect service/i })).not.toBeInTheDocument();
  });
});
