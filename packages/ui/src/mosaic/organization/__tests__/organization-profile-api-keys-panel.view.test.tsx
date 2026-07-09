import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import type {
  ApiKeysCreateProps,
  ApiKeysListProps,
  ApiKeysRevokeProps,
} from '../organization-profile-api-keys-panel.view';
import { OrganizationProfileApiKeysPanelView } from '../organization-profile-api-keys-panel.view';
import type { OrganizationProfileApiKeysPanelCreateContext } from '../organization-profile-api-keys-panel-create.machine';
import type { OrganizationProfileApiKeysPanelRevokeContext } from '../organization-profile-api-keys-panel-revoke.machine';

function createSnap(
  value: string,
  context: Partial<OrganizationProfileApiKeysPanelCreateContext> = {},
): Snapshot<OrganizationProfileApiKeysPanelCreateContext> {
  return {
    value,
    status: 'active',
    context: {
      draftName: '',
      draftDescription: '',
      draftExpiration: undefined,
      showDescription: false,
      createdKey: null,
      error: null,
      createAPIKey: async () => ({ name: '', secret: '' }),
      ...context,
    },
  };
}

function revokeSnap(
  value: string,
  context: Partial<OrganizationProfileApiKeysPanelRevokeContext> = {},
): Snapshot<OrganizationProfileApiKeysPanelRevokeContext> {
  return {
    value,
    status: 'active',
    context: {
      selectedKeyId: '',
      selectedKeyName: '',
      confirmationValue: '',
      confirmationText: 'Revoke',
      error: null,
      revokeAPIKey: async () => {},
      ...context,
    },
  };
}

interface Overrides {
  list?: Partial<ApiKeysListProps>;
  canManage?: boolean;
  create?: Partial<ApiKeysCreateProps>;
  revoke?: Partial<ApiKeysRevokeProps>;
}

function setup(over: Overrides = {}) {
  const onSearchChange = vi.fn();
  const onPageChange = vi.fn();
  const createSend = vi.fn();
  const revokeSend = vi.fn();

  render(
    <OrganizationProfileApiKeysPanelView
      list={{
        rows: [],
        isLoading: false,
        page: 1,
        pageCount: 1,
        itemCount: 0,
        onPageChange,
        searchValue: '',
        onSearchChange,
        ...over.list,
      }}
      canManage={over.canManage ?? true}
      create={{
        snapshot: createSnap('closed'),
        send: createSend,
        canSubmit: false,
        showDescription: false,
        ...over.create,
      }}
      revoke={{ snapshot: revokeSnap('idle'), send: revokeSend, canConfirm: false, ...over.revoke }}
    />,
  );

  return { onSearchChange, onPageChange, createSend, revokeSend };
}

const row = {
  id: 'ak_1',
  name: 'CI token',
  createdAt: new Date('2024-01-01'),
  expiration: null,
  lastUsedAt: null,
};

describe('OrganizationProfileApiKeysPanelView', () => {
  it('emits search changes', () => {
    const { onSearchChange } = setup();
    fireEvent.change(screen.getByLabelText('Search keys'), { target: { value: 'ci' } });
    expect(onSearchChange).toHaveBeenCalledWith('ci');
  });

  it('shows the add button only when the caller can manage keys', () => {
    setup({ canManage: false });
    expect(screen.queryByRole('button', { name: 'Add new key' })).not.toBeInTheDocument();
  });

  it('opens the create form from the add button', () => {
    const { createSend } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Add new key' }));
    expect(createSend).toHaveBeenCalledWith({ type: 'OPEN' });
  });

  it('emits the drafted name while editing', () => {
    const { createSend } = setup({ create: { snapshot: createSnap('editing') } });
    fireEvent.change(screen.getByLabelText('Secret key name'), { target: { value: 'CI token' } });
    expect(createSend).toHaveBeenCalledWith({ type: 'TYPE_NAME', value: 'CI token' });
  });

  it('converts an expiration option into seconds', () => {
    const { createSend } = setup({ create: { snapshot: createSnap('editing') } });

    fireEvent.change(screen.getByLabelText('Expiration'), { target: { value: '1d' } });
    const call = createSend.mock.calls.find(([event]) => event.type === 'SET_EXPIRATION');
    expect(call?.[0].secondsUntilExpiration).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Expiration'), { target: { value: 'never' } });
    expect(createSend).toHaveBeenLastCalledWith({ type: 'SET_EXPIRATION', secondsUntilExpiration: undefined });
  });

  it('hides the description field unless enabled', () => {
    setup({ create: { snapshot: createSnap('editing'), showDescription: false } });
    expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
  });

  it('shows the description field when enabled', () => {
    const { createSend } = setup({ create: { snapshot: createSnap('editing'), showDescription: true } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'for CI' } });
    expect(createSend).toHaveBeenCalledWith({ type: 'TYPE_DESCRIPTION', value: 'for CI' });
  });

  it('keeps the submit disabled until the machine allows it', () => {
    setup({ create: { snapshot: createSnap('editing', { draftName: 'CI token' }), canSubmit: false } });
    expect(screen.getByRole('button', { name: 'Create key' })).toBeDisabled();
  });

  it('submits the create form when allowed', () => {
    const { createSend } = setup({
      create: { snapshot: createSnap('editing', { draftName: 'CI token' }), canSubmit: true },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create key' }));
    expect(createSend).toHaveBeenCalledWith({ type: 'SUBMIT' });
  });

  it('renders the create error', () => {
    setup({ create: { snapshot: createSnap('editing', { error: 'API Key name already exists.' }) } });
    expect(screen.getByRole('alert')).toHaveTextContent('API Key name already exists.');
  });

  it('renders a loading row', () => {
    setup({ list: { isLoading: true } });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders the empty state', () => {
    setup({ list: { rows: [] } });
    expect(screen.getByText('No API keys found')).toBeInTheDocument();
  });

  it('renders rows and requests revocation', () => {
    const { revokeSend } = setup({ list: { rows: [row] } });
    expect(screen.getByText('CI token')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    expect(revokeSend).toHaveBeenCalledWith({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' });
  });

  it('hides the row revoke action when the caller cannot manage keys', () => {
    setup({ canManage: false, list: { rows: [row] } });
    expect(screen.queryByRole('button', { name: 'Revoke' })).not.toBeInTheDocument();
  });

  it('paginates when there is more than one page', () => {
    const { onPageChange } = setup({ list: { rows: [row], page: 2, pageCount: 3 } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('does not render pagination for a single page', () => {
    setup({ list: { rows: [row], page: 1, pageCount: 1 } });
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('reveals the created secret and closes the copy step', () => {
    const { createSend } = setup({
      create: { snapshot: createSnap('showingSecret', { createdKey: { name: 'CI token', secret: 'sk_secret' } }) },
    });
    expect(screen.getByLabelText('API key')).toHaveValue('sk_secret');
    fireEvent.click(screen.getByRole('button', { name: 'Copy & Close' }));
    expect(createSend).toHaveBeenCalledWith({ type: 'CLOSE' });
  });

  it('drives the revoke confirmation', () => {
    const { revokeSend } = setup({
      revoke: {
        snapshot: revokeSnap('confirming', { selectedKeyName: 'CI token', confirmationValue: '' }),
        canConfirm: true,
      },
    });

    expect(screen.getByText(/Revoke "CI token"/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Revoke confirmation'), { target: { value: 'Revoke' } });
    expect(revokeSend).toHaveBeenCalledWith({ type: 'TYPE_CONFIRMATION', value: 'Revoke' });

    fireEvent.click(screen.getByRole('button', { name: 'Revoke key' }));
    expect(revokeSend).toHaveBeenCalledWith({ type: 'CONFIRM' });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(revokeSend).toHaveBeenCalledWith({ type: 'CANCEL' });
  });
});
