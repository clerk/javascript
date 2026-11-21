import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { clearFetchCache } from '@/ui/hooks';

import { ConnectionsSection } from '../ConnectionsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');

const withUser = createFixtures.config(f => {
  f.withUser({});
});

const connector = { id: 'cnr_1', slug: 'acme', displayName: 'Acme Tasks', scopeLabels: { 'tasks.read': 'Read tasks' } };
const connection = {
  id: 'cnn_1',
  slug: 'acme',
  connector: 'acme',
  status: 'active',
  scopes: ['tasks.read', 'tasks.write'],
  providerAccount: { id: '1', label: 'pat@acme.example' },
};

const mockConnect = (fixtures: any, { connectors = [connector], connections = [] as unknown[] } = {}) => {
  clearFetchCache();
  const api = {
    connectors: { list: vi.fn().mockResolvedValue({ data: connectors, total_count: connectors.length }) },
    connections: {
      list: vi.fn().mockResolvedValue({ data: connections, total_count: connections.length }),
      create: vi.fn(),
      reauthorize: vi.fn(),
      disconnect: vi.fn().mockResolvedValue({}),
    },
  };
  Object.defineProperty(fixtures.clerk, 'connect', { value: api, configurable: true });
  return api;
};

const apiKeyConnector = {
  id: 'cnr_2',
  slug: 'openai',
  displayName: 'OpenAI',
  scopeLabels: {},
  authenticationMethod: 'api_key',
  apiKey: { instructions: 'Create a key in your OpenAI settings.', helpUrl: 'https://platform.openai.com/api-keys' },
};
const apiKeyConnection = {
  id: 'cnn_3',
  slug: 'openai',
  connector: 'openai',
  status: 'active',
  scopes: [],
  providerAccount: null,
  apiKeyHint: '••••abcd',
};

describe('ConnectionsSection', () => {
  it('stores a pasted API key without a redirect', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures, { connectors: [apiKeyConnector] });
    api.connections.create.mockResolvedValue({ status: 'complete', connection: apiKeyConnection });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /connect service/i }));
    await userEvent.click(await screen.findByText('OpenAI'));
    expect(await screen.findByText('Create a key in your OpenAI settings.')).toBeInTheDocument();
    await userEvent.type(await screen.findByLabelText(/api key/i), '  sk-test-abcd  ');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(api.connections.create).toHaveBeenCalledWith({
        connector: 'openai',
        apiKey: 'sk-test-abcd',
        additionalAccount: false,
      }),
    );
  });

  it('reconnects a disconnected API key connection instead of adding another account', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures, {
      connectors: [apiKeyConnector],
      connections: [{ ...apiKeyConnection, status: 'disconnected' }],
    });
    api.connections.reauthorize.mockResolvedValue({ status: 'complete', connection: apiKeyConnection });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /connect service/i }));
    await userEvent.click(await waitFor(() => document.querySelector('[data-connector="openai"]') as HTMLElement));
    await userEvent.type(await screen.findByLabelText(/api key/i), 'sk-again-1234');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(api.connections.reauthorize).toHaveBeenCalledWith('cnn_3', { apiKey: 'sk-again-1234' }));
    expect(api.connections.create).not.toHaveBeenCalled();
  });

  it('reconnects a disconnected OAuth connection instead of adding another account', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures, { connections: [{ ...connection, status: 'disconnected' }] });
    api.connections.reauthorize.mockResolvedValue({ status: 'complete', connection });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /connect service/i }));
    await userEvent.click(await waitFor(() => document.querySelector('[data-connector="acme"]') as HTMLElement));

    await waitFor(() => expect(api.connections.reauthorize).toHaveBeenCalledWith('cnn_1', expect.any(Object)));
    expect(api.connections.create).not.toHaveBeenCalled();
  });

  it('shows the key hint and replaces the key through reauthorize', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures, { connectors: [apiKeyConnector], connections: [apiKeyConnection] });
    api.connections.reauthorize.mockResolvedValue({ status: 'complete', connection: apiKeyConnection });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    expect(await screen.findByText(/••••abcd/)).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /replace api key/i }));
    await userEvent.type(await screen.findByLabelText(/api key/i), 'sk-new-wxyz');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(api.connections.reauthorize).toHaveBeenCalledWith('cnn_3', { apiKey: 'sk-new-wxyz' }));
  });

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

  it('reads every page of connections', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures, { connectors: [] });
    const second = {
      ...connection,
      id: 'cnn_2',
      slug: 'acme-2',
      providerAccount: { id: '2', label: 'second@acme.example' },
    };
    api.connections.list
      .mockResolvedValueOnce({ data: [connection], total_count: 2 })
      .mockResolvedValueOnce({ data: [second], total_count: 2 });
    render(<ConnectionsSection />, { wrapper });

    expect(await screen.findByText(/second@acme\.example/)).toBeInTheDocument();
    expect(api.connections.list).toHaveBeenLastCalledWith({ limit: 100, offset: 1 });
  });

  it('offers no reconnect for a service the user can no longer connect', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    mockConnect(fixtures, { connectors: [], connections: [{ ...connection, status: 'needs_attention' }] });
    render(<ConnectionsSection />, { wrapper });

    expect(await screen.findByText(/pat@acme\.example/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reconnect/i })).not.toBeInTheDocument();
  });

  it('shows the access the user granted, with readable names where known', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    mockConnect(fixtures, { connections: [connection] });
    render(<ConnectionsSection />, { wrapper });

    expect(await screen.findByText('Access: Read tasks, tasks.write')).toBeInTheDocument();
  });

  it('offers another account for a service the user already connected', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    const api = mockConnect(fixtures, { connections: [connection] });
    api.connections.create.mockResolvedValue({ status: 'complete', connection });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /connect service/i }));
    await userEvent.click(await screen.findByText('Acme Tasks (another account)'));
    await waitFor(() =>
      expect(api.connections.create).toHaveBeenCalledWith(
        expect.objectContaining({ connector: 'acme', additionalAccount: true }),
      ),
    );
  });

  describe('connect failures', () => {
    afterEach(() => {
      window.history.replaceState(null, '', '/');
      window.sessionStorage.clear();
    });

    const withFailure = (code: string, connectorSlug?: string) => {
      window.history.replaceState(null, '', `/?keep=1&${'clerk_connect_error'}=${code}`);
      if (connectorSlug) {
        window.sessionStorage.setItem('clerk_connect_pending_connector', connectorSlug);
      }
    };

    it.each([
      ['access_denied', /you cancelled the request at Acme Tasks/i],
      ['insufficient_scopes', /did not approve all the access .* at Acme Tasks/i],
      ['provider_account_mismatch', /different account at Acme Tasks than the one this connection uses/i],
      ['account_already_connected', /you already connected the account you chose at Acme Tasks/i],
      ['authorization_failed', /could not be completed at Acme Tasks/i],
      ['attempt_expired', /request expired/i],
      ['attempt_invalid', /no longer valid/i],
      ['something_new', /the connection could not be completed\. please try again/i],
    ])('explains %s', async (code, message) => {
      withFailure(code, 'acme');
      const { wrapper, fixtures } = await createFixtures(withUser);
      mockConnect(fixtures);
      render(<ConnectionsSection />, { wrapper });

      expect(await screen.findByText(message)).toBeInTheDocument();
    });

    it('does not tell the user to try again for an account that is already connected', async () => {
      withFailure('account_already_connected');
      const { wrapper, fixtures } = await createFixtures(withUser);
      mockConnect(fixtures);
      render(<ConnectionsSection />, { wrapper });

      const banner = await screen.findByText(/you already connected the account you chose at the service/i);
      expect(banner).toHaveAttribute('data-connect-error', 'account_already_connected');
      expect(banner).not.toHaveTextContent(/try again/i);
    });

    it('removes the error from the URL and keeps the other parameters', async () => {
      withFailure('access_denied', 'acme');
      const { wrapper, fixtures } = await createFixtures(withUser);
      mockConnect(fixtures);
      render(<ConnectionsSection />, { wrapper });

      await screen.findByText(/you cancelled the request/i);
      await waitFor(() => expect(window.location.search).toBe('?keep=1'));
    });

    it('clears the banner when the user opens the connect menu', async () => {
      withFailure('access_denied', 'acme');
      const { wrapper, fixtures } = await createFixtures(withUser);
      mockConnect(fixtures);
      const { userEvent } = render(<ConnectionsSection />, { wrapper });

      await screen.findByText(/you cancelled the request/i);
      await userEvent.click(screen.getByRole('button', { name: /connect service/i }));
      expect(screen.queryByText(/you cancelled the request/i)).not.toBeInTheDocument();
    });

    it('clears the banner when the user opens a row action', async () => {
      withFailure('access_denied', 'acme');
      const { wrapper, fixtures } = await createFixtures(withUser);
      mockConnect(fixtures, { connections: [connection] });
      const { userEvent } = render(<ConnectionsSection />, { wrapper });

      await screen.findByText(/you cancelled the request/i);
      await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
      await userEvent.click(await screen.findByRole('menuitem', { name: /disconnect/i }));
      await waitFor(() => expect(screen.queryByText(/you cancelled the request/i)).not.toBeInTheDocument());
    });

    it('remembers the connector it sends to the provider', async () => {
      const { wrapper, fixtures } = await createFixtures(withUser);
      const api = mockConnect(fixtures);
      api.connections.create.mockReturnValue(new Promise(() => {}));
      const { userEvent } = render(<ConnectionsSection />, { wrapper });

      await userEvent.click(await screen.findByRole('button', { name: /connect service/i }));
      await userEvent.click(await screen.findByText('Acme Tasks'));
      await waitFor(() => expect(window.sessionStorage.getItem('clerk_connect_pending_connector')).toBe('acme'));
    });
  });

  it('shows the slug so two accounts of one service can be told apart', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    mockConnect(fixtures, {
      connections: [connection, { ...connection, id: 'cnn_2', slug: 'acme-2' }],
    });
    render(<ConnectionsSection />, { wrapper });

    expect(await screen.findByText('acme-2')).toBeInTheDocument();
    expect(screen.getByText('acme')).toBeInTheDocument();
  });

  it('uses the connection display name and marks a disabled service unavailable', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    mockConnect(fixtures, {
      connectors: [],
      connections: [
        { ...connection, status: 'needs_attention', connectorStatus: 'disabled', connectorDisplayName: 'Acme Tasks' },
        {
          ...connection,
          id: 'cnn_2',
          slug: 'acme-2',
          status: 'disconnected',
          connectorStatus: 'disabled',
          connectorDisplayName: 'Acme Tasks',
          providerAccount: { id: '2', label: 'sam@acme.example' },
        },
      ],
    });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    expect(await screen.findByText(/sam@acme\.example/)).toBeInTheDocument();
    expect(screen.getAllByText('Acme Tasks')).toHaveLength(2);
    expect(screen.getAllByText('Unavailable')).toHaveLength(2);
    expect(screen.getAllByText(/turned off by the application/i)).toHaveLength(2);
    expect(screen.queryByText(/needs attention/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reconnect/i })).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
    expect(await screen.findByRole('menuitem', { name: /disconnect/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /replace/i })).not.toBeInTheDocument();
  });

  it('names the account a menu entry reconnects', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    mockConnect(fixtures, { connections: [{ ...connection, status: 'disconnected' }] });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /connect service/i }));
    expect(await screen.findByText('Acme Tasks (pat@acme.example)')).toBeInTheDocument();
  });

  it('closes the replace form when the connect menu opens', async () => {
    const { wrapper, fixtures } = await createFixtures(withUser);
    mockConnect(fixtures, { connectors: [apiKeyConnector], connections: [apiKeyConnection] });
    const { userEvent } = render(<ConnectionsSection />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /replace api key/i }));
    expect(await screen.findByLabelText(/api key/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /connect service/i }));
    await waitFor(() => expect(screen.queryByLabelText(/api key/i)).not.toBeInTheDocument());
  });
});
