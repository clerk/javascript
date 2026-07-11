import type { Snapshot } from '../machine/types';
import type {
  CreatedApiKey,
  OrganizationProfileApiKeysPanelCreateContext,
  OrganizationProfileApiKeysPanelCreateEvent,
} from './organization-profile-api-keys-panel-create.machine';
import type {
  OrganizationProfileApiKeysPanelRevokeContext,
  OrganizationProfileApiKeysPanelRevokeEvent,
} from './organization-profile-api-keys-panel-revoke.machine';

/** A plain, Clerk-free row model. The controller maps `APIKeyResource` down to this. */
export interface ApiKeyRow {
  id: string;
  name: string;
  createdAt: Date;
  expiration: Date | null;
  lastUsedAt: Date | null;
}

export interface ApiKeysListProps {
  rows: ApiKeyRow[];
  isLoading: boolean;
  page: number;
  pageCount: number;
  itemCount: number;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export interface ApiKeysCreateProps {
  snapshot: Snapshot<OrganizationProfileApiKeysPanelCreateContext>;
  send: (event: OrganizationProfileApiKeysPanelCreateEvent) => void;
  canSubmit: boolean;
  showDescription: boolean;
}

export interface ApiKeysRevokeProps {
  snapshot: Snapshot<OrganizationProfileApiKeysPanelRevokeContext>;
  send: (event: OrganizationProfileApiKeysPanelRevokeEvent) => void;
  canConfirm: boolean;
}

export interface OrganizationProfileApiKeysPanelViewProps {
  list: ApiKeysListProps;
  canManage: boolean;
  create: ApiKeysCreateProps;
  revoke: ApiKeysRevokeProps;
}

// The legacy expiration choices (CreateAPIKeyForm). Kept here since the option→seconds
// conversion needs the current time and belongs to the view.
const EXPIRATION_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '60d', label: '60 Days' },
  { value: '90d', label: '90 Days' },
  { value: '180d', label: '180 Days' },
  { value: '1y', label: '1 Year' },
] as const;

const EXPIRATION_DURATIONS: Record<string, (date: Date) => void> = {
  '1d': date => date.setDate(date.getDate() + 1),
  '7d': date => date.setDate(date.getDate() + 7),
  '30d': date => date.setDate(date.getDate() + 30),
  '60d': date => date.setDate(date.getDate() + 60),
  '90d': date => date.setDate(date.getDate() + 90),
  '180d': date => date.setDate(date.getDate() + 180),
  '1y': date => date.setFullYear(date.getFullYear() + 1),
};

function secondsUntilExpiration(option: string): number | undefined {
  const mutate = EXPIRATION_DURATIONS[option];
  if (!mutate) {
    return undefined;
  }
  const now = new Date();
  const future = new Date(now);
  mutate(future);
  return Math.floor((future.getTime() - now.getTime()) / 1000);
}

function createdAndExpiration(row: ApiKeyRow): string {
  const created = `Created ${row.createdAt.toLocaleDateString()}`;
  return row.expiration ? `${created} • Expires ${row.expiration.toLocaleDateString()}` : `${created} • Never expires`;
}

function CopySecret({ createdKey, onClose }: { createdKey: CreatedApiKey; onClose: () => void }) {
  const handleCopyAndClose = () => {
    // Best-effort copy; absent in some test environments, so the optional chain short-circuits.
    void navigator.clipboard?.writeText(createdKey.secret).catch(() => undefined);
    onClose();
  };

  return (
    <div role='dialog'>
      <p>Copy your &quot;{createdKey.name}&quot; API key now. You will not be able to view it again.</p>
      <label>
        API key
        <input
          aria-label='API key'
          readOnly
          value={createdKey.secret}
        />
      </label>
      <button
        type='button'
        onClick={handleCopyAndClose}
      >
        Copy &amp; Close
      </button>
    </div>
  );
}

export function OrganizationProfileApiKeysPanelView({
  list,
  canManage,
  create,
  revoke,
}: OrganizationProfileApiKeysPanelViewProps) {
  const createState = create.snapshot.value;
  const isCreating = createState === 'creating';
  const isFormOpen = createState === 'editing' || isCreating;
  const revokeState = revoke.snapshot.value;
  const isRevokeOpen = revokeState === 'confirming' || revokeState === 'revoking';
  const isRevoking = revokeState === 'revoking';
  const columnCount = canManage ? 3 : 2;

  return (
    <div>
      <input
        type='search'
        aria-label='Search keys'
        placeholder='Search keys'
        value={list.searchValue}
        onChange={event => list.onSearchChange(event.target.value)}
      />

      {canManage && !isFormOpen && (
        <button
          type='button'
          onClick={() => create.send({ type: 'OPEN' })}
        >
          Add new key
        </button>
      )}

      {isFormOpen && (
        <form
          aria-label='Create API key'
          onSubmit={event => {
            event.preventDefault();
            create.send({ type: 'SUBMIT' });
          }}
        >
          <label>
            Secret key name
            <input
              aria-label='Secret key name'
              value={create.snapshot.context.draftName}
              disabled={isCreating}
              onChange={event => create.send({ type: 'TYPE_NAME', value: event.target.value })}
            />
          </label>
          <label>
            Expiration
            <select
              aria-label='Expiration'
              disabled={isCreating}
              onChange={event =>
                create.send({
                  type: 'SET_EXPIRATION',
                  secondsUntilExpiration: secondsUntilExpiration(event.target.value),
                })
              }
            >
              {EXPIRATION_OPTIONS.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {create.showDescription && (
            <label>
              Description
              <input
                aria-label='Description'
                value={create.snapshot.context.draftDescription}
                disabled={isCreating}
                onChange={event => create.send({ type: 'TYPE_DESCRIPTION', value: event.target.value })}
              />
            </label>
          )}
          {create.snapshot.context.error && <p role='alert'>{create.snapshot.context.error}</p>}
          <button
            type='submit'
            disabled={!create.canSubmit || isCreating}
          >
            Create key
          </button>
          <button
            type='button'
            disabled={isCreating}
            onClick={() => create.send({ type: 'CANCEL' })}
          >
            Cancel
          </button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Last used</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {list.isLoading ? (
            <tr>
              <td colSpan={columnCount}>Loading…</td>
            </tr>
          ) : list.rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount}>No API keys found</td>
            </tr>
          ) : (
            list.rows.map(row => (
              <tr key={row.id}>
                <td>
                  <div>{row.name}</div>
                  <div>{createdAndExpiration(row)}</div>
                </td>
                <td>{row.lastUsedAt ? row.lastUsedAt.toLocaleDateString() : '-'}</td>
                {canManage && (
                  <td>
                    <button
                      type='button'
                      disabled={revokeState !== 'idle'}
                      onClick={() => revoke.send({ type: 'REQUEST', keyId: row.id, keyName: row.name })}
                    >
                      Revoke
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {list.pageCount > 1 && (
        <div>
          <button
            type='button'
            disabled={list.page <= 1}
            onClick={() => list.onPageChange(list.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {list.page} of {list.pageCount}
          </span>
          <button
            type='button'
            disabled={list.page >= list.pageCount}
            onClick={() => list.onPageChange(list.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {createState === 'showingSecret' && create.snapshot.context.createdKey && (
        <CopySecret
          createdKey={create.snapshot.context.createdKey}
          onClose={() => create.send({ type: 'CLOSE' })}
        />
      )}

      {isRevokeOpen && (
        <form
          aria-label='Revoke API key'
          onSubmit={event => {
            event.preventDefault();
            revoke.send({ type: 'CONFIRM' });
          }}
        >
          <p>Revoke &quot;{revoke.snapshot.context.selectedKeyName}&quot;? Type &quot;Revoke&quot; to confirm.</p>
          <label>
            Type &quot;Revoke&quot; to confirm
            <input
              aria-label='Revoke confirmation'
              value={revoke.snapshot.context.confirmationValue}
              disabled={isRevoking}
              onChange={event => revoke.send({ type: 'TYPE_CONFIRMATION', value: event.target.value })}
            />
          </label>
          {revoke.snapshot.context.error && <p role='alert'>{revoke.snapshot.context.error}</p>}
          <button
            type='submit'
            disabled={!revoke.canConfirm || isRevoking}
          >
            Revoke key
          </button>
          <button
            type='button'
            disabled={isRevoking}
            onClick={() => revoke.send({ type: 'CANCEL' })}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
