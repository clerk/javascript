import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, waitFor } from '@/test/utils';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';

import type { APIKeysPageData } from '../api-keys.types';
import { APIKeysPage } from '../APIKeys';

const state = vi.hoisted(() => ({
  controller: null as APIKeysPageData | null,
  revalidate: vi.fn(),
  fetchPage: vi.fn(),
  showCreateForm: true,
  sibling: vi.fn(),
}));

vi.mock('@clerk/shared/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/react')>()),
  useAPIKeys: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    page: 1,
    pageCount: 1,
    count: 0,
    revalidate: state.revalidate,
    fetchPage: state.fetchPage,
  }),
}));

vi.mock('../api-keys.view', () => ({
  APIKeysPageView: ({ controller }: { controller: APIKeysPageData }) => {
    const card = useCardState();
    state.controller = controller;
    return (
      <>
        {state.showCreateForm && (
          <Form.Root
            data-testid='create-form'
            onSubmit={() => controller.handleCreateAPIKey(params)}
          />
        )}
        <Form.Root
          data-testid='sibling-form'
          onSubmit={state.sibling}
        />
        <output data-testid='secret'>{controller.copyKeySecret}</output>
        <output data-testid='search'>{controller.searchValue}</output>
        <output data-testid='busy'>{String(card.isLoading)}</output>
        <output data-testid='error'>{card.error}</output>
      </>
    );
  },
}));

const { createFixtures } = bindCreateFixtures('APIKeys');
const params = { name: 'Key', secondsUntilExpiration: undefined };

beforeEach(() => {
  state.controller = null;
  state.revalidate.mockReset().mockResolvedValue(undefined);
  state.fetchPage.mockReset();
  state.showCreateForm = true;
  state.sibling.mockReset();
});

describe('API key page ownership', () => {
  it('shares one pending creation request and permits a new request after completion', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const completion = createDeferredPromise();
    fixtures.clerk.apiKeys.create = vi.fn().mockReturnValue(completion.promise);
    const { getByTestId } = render(<APIKeysPage subject='user_123' />, { wrapper });
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      fireEvent.submit(getByTestId('create-form'));
      first = state.controller!.handleCreateAPIKey(params);
      second = state.controller!.handleCreateAPIKey(params);
    });
    expect(first).toBe(second);
    expect(fixtures.clerk.apiKeys.create).toHaveBeenCalledOnce();
    expect(getByTestId('busy')).toHaveTextContent('true');

    await act(async () => {
      completion.resolve({ name: 'Key', secret: 'secret_123' });
      await first;
    });
    expect(getByTestId('secret')).toHaveTextContent('secret_123');
    expect(getByTestId('busy')).toHaveTextContent('false');
    await act(async () => {
      await state.controller!.handleCreateAPIKey(params);
    });
    expect(fixtures.clerk.apiKeys.create).toHaveBeenCalledTimes(2);
  });

  it('resets search, copied secrets, and modal state when the subject changes', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.apiKeys.create = vi.fn().mockResolvedValue({ name: 'Key', secret: 'secret_123' });
    const { rerender, getByTestId } = render(<APIKeysPage subject='user_first' />, { wrapper });
    act(() => state.controller!.setSearchValue('previous search'));
    await act(async () => {
      await state.controller!.handleCreateAPIKey(params);
    });
    expect(state.controller!.isCopyModalOpen).toBe(true);

    rerender(<APIKeysPage subject='user_second' />);
    expect(getByTestId('secret')).toBeEmptyDOMElement();
    expect(getByTestId('search')).toBeEmptyDOMElement();
    expect(state.controller!.isCopyModalOpen).toBe(false);
    expect(state.controller!.isRevokeModalOpen).toBe(false);
  });

  it.each(['resolve', 'reject'] as const)('ignores an old creation %s while the new subject is busy', async outcome => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const oldCompletion = createDeferredPromise();
    const newCompletion = createDeferredPromise();
    fixtures.clerk.apiKeys.create = vi
      .fn()
      .mockReturnValueOnce(oldCompletion.promise)
      .mockReturnValueOnce(newCompletion.promise);
    const { rerender, getByTestId } = render(<APIKeysPage subject='user_first' />, { wrapper });
    let oldPending!: Promise<void>;
    let newPending!: Promise<void>;
    act(() => {
      fireEvent.submit(getByTestId('create-form'));
      oldPending = state.controller!.handleCreateAPIKey(params);
    });
    rerender(<APIKeysPage subject='user_second' />);
    act(() => {
      fireEvent.submit(getByTestId('create-form'));
      newPending = state.controller!.handleCreateAPIKey(params);
    });
    await act(async () => {
      if (outcome === 'resolve') {
        oldCompletion.resolve({ name: 'Old key', secret: 'old_secret' });
      } else {
        oldCompletion.reject(new Error('Old failure'));
      }
      await oldPending;
    });

    expect(getByTestId('secret')).toBeEmptyDOMElement();
    expect(getByTestId('error')).toBeEmptyDOMElement();
    expect(getByTestId('busy')).toHaveTextContent('true');
    await act(async () => {
      newCompletion.resolve({ name: 'New key', secret: 'new_secret' });
      await newPending;
    });
    expect(getByTestId('secret')).toHaveTextContent('new_secret');
    expect(getByTestId('busy')).toHaveTextContent('false');
    expect(fixtures.clerk.apiKeys.create).toHaveBeenNthCalledWith(1, { ...params, subject: 'user_first' });
    expect(fixtures.clerk.apiKeys.create).toHaveBeenNthCalledWith(2, { ...params, subject: 'user_second' });
  });

  it('releases the pending request guard after a synchronous failure', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.apiKeys.create = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('Request failed');
      })
      .mockResolvedValue({ name: 'Key', secret: 'secret_123' });
    const { getByTestId } = render(<APIKeysPage subject='user_123' />, { wrapper });
    await act(async () => {
      await expect(state.controller!.handleCreateAPIKey(params)).rejects.toThrow('Request failed');
    });
    expect(getByTestId('busy')).toHaveTextContent('false');
    await act(async () => {
      await state.controller!.handleCreateAPIKey(params);
    });
    expect(getByTestId('secret')).toHaveTextContent('secret_123');
    expect(fixtures.clerk.apiKeys.create).toHaveBeenCalledTimes(2);
  });

  it('keeps the form busy for one creation request and releases loading on completion', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const completion = createDeferredPromise();
    fixtures.clerk.apiKeys.create = vi.fn().mockReturnValue(completion.promise);
    const { getByTestId } = render(<APIKeysPage subject='user_123' />, { wrapper });
    act(() => {
      fireEvent.submit(getByTestId('create-form'));
      fireEvent.submit(getByTestId('create-form'));
      fireEvent.submit(getByTestId('sibling-form'));
    });
    expect(fixtures.clerk.apiKeys.create).toHaveBeenCalledOnce();
    expect(state.sibling).not.toHaveBeenCalled();
    expect(getByTestId('busy')).toHaveTextContent('true');
    await act(async () => {
      completion.resolve({ name: 'Key', secret: 'secret_123' });
      await completion.promise;
    });
    await waitFor(() => expect(getByTestId('busy')).toHaveTextContent('false'));
    expect(getByTestId('secret')).toHaveTextContent('secret_123');
  });

  it('does not release a sibling request when creation finishes after its form closes', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const creation = createDeferredPromise();
    const sibling = createDeferredPromise();
    fixtures.clerk.apiKeys.create = vi.fn().mockReturnValue(creation.promise);
    state.sibling.mockReturnValue(sibling.promise);
    const { getByTestId, rerender } = render(<APIKeysPage subject='user_123' />, { wrapper });
    fireEvent.submit(getByTestId('create-form'));
    expect(getByTestId('busy')).toHaveTextContent('true');
    state.showCreateForm = false;
    rerender(<APIKeysPage subject='user_123' />);
    expect(getByTestId('busy')).toHaveTextContent('false');
    fireEvent.submit(getByTestId('sibling-form'));
    expect(state.sibling).toHaveBeenCalledOnce();
    await act(async () => {
      creation.resolve({ name: 'Key', secret: 'secret_123' });
      await creation.promise;
    });
    expect(getByTestId('busy')).toHaveTextContent('true');
    await act(async () => {
      sibling.resolve();
      await sibling.promise;
    });
    await waitFor(() => expect(getByTestId('busy')).toHaveTextContent('false'));
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'resets page state when the %s changes under the same organization subject',
    async field => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });
      const subject = fixtures.clerk.organization!.id;
      fixtures.clerk.apiKeys.create = vi.fn().mockResolvedValue({ name: 'Key', secret: 'secret_123' });
      const rendered = render(<APIKeysPage subject={subject} />, { wrapper });
      act(() => {
        state.controller!.setSearchValue('old search');
      });
      await act(async () => {
        await state.controller!.handleCreateAPIKey(params);
      });
      expect(state.controller!.isCopyModalOpen).toBe(true);
      const replacement = {
        ...fixtures.clerk[field],
        id: 'other',
        ...(field === 'user' ? { organizationMemberships: fixtures.clerk.user!.organizationMemberships } : {}),
      };
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue(replacement as never);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources,
        [field]: replacement,
      };
      rendered.rerender(<APIKeysPage subject={subject} />);
      expect(rendered.getByTestId('secret')).toBeEmptyDOMElement();
      expect(rendered.getByTestId('search')).toBeEmptyDOMElement();
      expect(state.controller!.isCopyModalOpen).toBe(false);
      expect(state.controller!.isRevokeModalOpen).toBe(false);
    },
  );

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks retained creation and query callbacks after the canonical %s changes',
    async field => {
      const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      fixtures.clerk.apiKeys.create = vi.fn();
      render(<APIKeysPage subject='user_123' />, { wrapper });
      const retained = state.controller!;
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await retained.handleCreateAPIKey(params);
      retained.onPageChange(2);
      await retained.onRevokeSuccess();
      expect(fixtures.clerk.apiKeys.create).not.toHaveBeenCalled();
      expect(state.fetchPage).not.toHaveBeenCalled();
      expect(state.revalidate).not.toHaveBeenCalled();
    },
  );

  it.each(['success', 'failure'] as const)(
    'ignores late creation %s after canonical ownership changes before rendering',
    async outcome => {
      const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      const deferred = createDeferredPromise<any>();
      fixtures.clerk.apiKeys.create = vi.fn().mockReturnValue(deferred.promise);
      const rendered = render(<APIKeysPage subject='user_123' />, { wrapper });
      const pending = state.controller!.handleCreateAPIKey(params);
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session, id: 'other' } as never);
      await act(async () => {
        if (outcome === 'success') {
          deferred.resolve({ name: 'Key', secret: 'old_secret' });
        } else {
          deferred.reject(new Error('Old failure'));
        }
        await pending;
      });
      expect(rendered.getByTestId('secret')).toBeEmptyDOMElement();
      expect(rendered.getByTestId('error')).toBeEmptyDOMElement();
      expect(state.revalidate).not.toHaveBeenCalled();
    },
  );
});
