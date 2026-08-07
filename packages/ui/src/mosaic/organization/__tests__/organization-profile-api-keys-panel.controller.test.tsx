import { ClerkAPIResponseError } from '@clerk/shared/error';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapCreateApiKeyError,
  useOrganizationProfileApiKeysPanelController,
} from '../organization-profile-api-keys-panel.controller';

let isLoaded: boolean;
let isSessionLoaded: boolean;
let canRead: boolean;
let canManage: boolean;
let organization: { id: string } | null;
let checkAuthorization: ReturnType<typeof vi.fn>;
let create: ReturnType<typeof vi.fn>;
let revoke: ReturnType<typeof vi.fn>;
let revalidate: ReturnType<typeof vi.fn>;
let fetchPage: ReturnType<typeof vi.fn>;
let apiKeysArgs: Record<string, unknown> | undefined;
let apiKeys: {
  data: unknown[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  pageCount: number;
  count: number;
  fetchPage: typeof fetchPage;
  revalidate: typeof revalidate;
};

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization }),
    useSession: () => ({
      isLoaded: isSessionLoaded,
      session: isSessionLoaded ? { id: 'sess_1', checkAuthorization } : undefined,
    }),
    useClerk: () => ({ apiKeys: { create, revoke } }),
    useAPIKeys: (params: Record<string, unknown>) => {
      apiKeysArgs = params;
      return apiKeys;
    },
  };
});

beforeEach(() => {
  isLoaded = true;
  isSessionLoaded = true;
  canRead = true;
  canManage = true;
  organization = { id: 'org_1' };
  checkAuthorization = vi.fn(({ permission }: { permission: string }) =>
    permission === 'org:sys_api_keys:read' ? canRead : permission === 'org:sys_api_keys:manage' ? canManage : false,
  );
  create = vi.fn().mockResolvedValue({ name: 'CI token', secret: 'sk_new' });
  revoke = vi.fn().mockResolvedValue(undefined);
  revalidate = vi.fn().mockResolvedValue(undefined);
  fetchPage = vi.fn();
  apiKeysArgs = undefined;
  apiKeys = {
    data: [{ id: 'ak_1', name: 'CI token', createdAt: new Date(0), expiration: null, lastUsedAt: null }],
    isLoading: false,
    isFetching: false,
    page: 1,
    pageCount: 1,
    count: 1,
    fetchPage,
    revalidate,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const c = useOrganizationProfileApiKeysPanelController({ showDescription: true });
  if (c.status !== 'ready') {
    return <output data-testid='status'>{c.status}</output>;
  }
  return (
    <div>
      <output data-testid='status'>ready</output>
      <output data-testid='canManage'>{String(c.canManage)}</output>
      <output data-testid='rows'>{c.list.rows.length}</output>
      <output data-testid='itemCount'>{c.list.itemCount}</output>
      <output data-testid='showDescription'>{String(c.create.showDescription)}</output>
      <output data-testid='createState'>{c.create.snapshot.value}</output>
      <output data-testid='secret'>{c.create.snapshot.context.createdKey?.secret ?? ''}</output>
      <output data-testid='revokeState'>{c.revoke.snapshot.value}</output>
      <button onClick={() => c.create.send({ type: 'OPEN' })}>c-open</button>
      <button onClick={() => c.create.send({ type: 'TYPE_NAME', value: 'CI token' })}>c-name</button>
      <button onClick={() => c.create.send({ type: 'SUBMIT' })}>c-submit</button>
      <button onClick={() => c.revoke.send({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' })}>r-req</button>
      <button onClick={() => c.revoke.send({ type: 'TYPE_CONFIRMATION', value: 'Revoke' })}>r-type</button>
      <button onClick={() => c.revoke.send({ type: 'CONFIRM' })}>r-confirm</button>
    </div>
  );
}

describe('useOrganizationProfileApiKeysPanelController', () => {
  it('is loading until the organization is loaded', () => {
    isLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });

  it('is loading until the session is loaded, without checking permissions', () => {
    isSessionLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    expect(checkAuthorization).not.toHaveBeenCalled();
  });

  it('is hidden when the caller cannot read API keys', () => {
    canRead = false;
    render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('hidden');
  });

  it('is ready and maps the paginated list into view props', () => {
    render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('ready');
    expect(screen.getByTestId('rows')).toHaveTextContent('1');
    expect(screen.getByTestId('itemCount')).toHaveTextContent('1');
    expect(screen.getByTestId('canManage')).toHaveTextContent('true');
    expect(screen.getByTestId('showDescription')).toHaveTextContent('true');
  });

  it('disables the fetch until reads are permitted, passing the subject and page size', () => {
    canRead = false;
    render(<Harness />);
    expect(apiKeysArgs).toMatchObject({ subject: 'org_1', pageSize: 10, enabled: false });
  });

  it('reflects a lack of manage permission', () => {
    canManage = false;
    render(<Harness />);
    expect(screen.getByTestId('canManage')).toHaveTextContent('false');
  });

  it('creates a key, reveals its secret, and revalidates the list', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('c-open'));
    fireEvent.click(screen.getByText('c-name'));
    await act(async () => {
      fireEvent.click(screen.getByText('c-submit'));
    });

    expect(create).toHaveBeenCalledWith({
      name: 'CI token',
      description: undefined,
      secondsUntilExpiration: undefined,
      subject: 'org_1',
    });
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('createState')).toHaveTextContent('showingSecret');
    expect(screen.getByTestId('secret')).toHaveTextContent('sk_new');
  });

  it('revokes the selected key and revalidates the list', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('r-req'));
    fireEvent.click(screen.getByText('r-type'));
    await act(async () => {
      fireEvent.click(screen.getByText('r-confirm'));
    });

    expect(revoke).toHaveBeenCalledWith({ apiKeyID: 'ak_1' });
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('revokeState')).toHaveTextContent('idle');
  });

  it('surfaces the mapped message when creation fails', async () => {
    create.mockRejectedValue(
      new ClerkAPIResponseError('conflict', {
        data: [{ code: 'token_creation_conflict', message: 'conflict' }],
        status: 422,
      }),
    );
    render(<Harness />);

    fireEvent.click(screen.getByText('c-open'));
    fireEvent.click(screen.getByText('c-name'));
    await act(async () => {
      fireEvent.click(screen.getByText('c-submit'));
    });

    expect(screen.getByTestId('createState')).toHaveTextContent('editing');
  });
});

describe('mapCreateApiKeyError', () => {
  const clerkError = (code: string, message = 'msg', longMessage?: string) =>
    new ClerkAPIResponseError('error', {
      data: [{ code, message, long_message: longMessage }],
      status: 422,
    });

  it('maps the quota code to the usage-limit message', () => {
    expect(mapCreateApiKeyError(clerkError('token_quota_exceeded'))).toContain('usage limit');
  });

  it('maps the conflict code to the name-exists message', () => {
    expect(mapCreateApiKeyError(clerkError('token_creation_conflict'))).toBe('API Key name already exists.');
  });

  it('prefers the API long message for unknown codes', () => {
    expect(mapCreateApiKeyError(clerkError('something_else', 'short', 'the long message'))).toBe('the long message');
  });

  it('falls back to a plain Error message', () => {
    expect(mapCreateApiKeyError(new Error('plain boom'))).toBe('plain boom');
  });

  it('falls back to a generic message for unknown throwables', () => {
    expect(mapCreateApiKeyError('nope')).toBe('Something went wrong. Please try again.');
  });
});
