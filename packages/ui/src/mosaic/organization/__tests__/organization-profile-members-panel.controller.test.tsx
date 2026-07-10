import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../machines/__tests__/test-utils';
import { useOrganizationProfileMembersPanelController } from '../organization-profile-members-panel.controller';

const READ = 'org:sys_memberships:read';
const MANAGE = 'org:sys_memberships:manage';

let permissions: string[];
let user: { id: string } | null;
let isSessionLoaded: boolean;
let isOrganizationLoaded: boolean;
let organization: { id: string } | null;
let memberships: {
  data: Array<Record<string, unknown>>;
  count: number;
  page: number;
  pageCount: number;
  isLoading: boolean;
  fetchPage: ReturnType<typeof vi.fn>;
  revalidate: ReturnType<typeof vi.fn>;
} | null;
let destroy: ReturnType<typeof vi.fn>;
let revalidate: ReturnType<typeof vi.fn>;
let fetchPage: ReturnType<typeof vi.fn>;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded: isOrganizationLoaded, organization, memberships }),
    useSession: () => ({
      isLoaded: isSessionLoaded,
      session: isSessionLoaded
        ? {
            id: 'sess_1',
            checkAuthorization: ({ permission }: { permission: string }) => permissions.includes(permission),
          }
        : undefined,
    }),
    useUser: () => ({ user }),
  };
});

beforeEach(() => {
  permissions = [READ, MANAGE];
  user = { id: 'user_self' };
  isSessionLoaded = true;
  isOrganizationLoaded = true;
  organization = { id: 'org_1' };
  destroy = vi.fn().mockResolvedValue(undefined);
  revalidate = vi.fn().mockResolvedValue(undefined);
  fetchPage = vi.fn();
  memberships = {
    data: [
      {
        id: 'mem_1',
        publicUserData: { userId: 'user_self', firstName: 'Alice', lastName: 'Doe', identifier: 'alice@example.com' },
        role: 'org:admin',
        roleName: 'Admin',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        destroy,
      },
      {
        id: 'mem_2',
        publicUserData: {
          userId: 'user_2',
          firstName: 'Bob',
          lastName: null,
          identifier: 'bob@example.com',
          banned: true,
        },
        role: 'org:member',
        roleName: 'Member',
        createdAt: new Date('2024-02-01T00:00:00Z'),
        destroy,
      },
    ],
    count: 2,
    page: 1,
    pageCount: 1,
    isLoading: false,
    fetchPage,
    revalidate,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationProfileMembersPanelController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>{controller.snapshot.value}</output>
      <output data-testid='error'>{controller.snapshot.context.error ?? ''}</output>
      <output data-testid='query'>{controller.snapshot.context.query}</output>
      <output data-testid='canManage'>{String(controller.canManage)}</output>
      <output data-testid='rows'>
        {controller.rows.map(r => `${r.name}|${r.roleLabel}|${r.isCurrentUser}|${r.isBanned}`).join(';')}
      </output>
      <button onClick={() => controller.send({ type: 'SEARCH_CHANGE', value: 'z' })}>ChangeSearch</button>
      <button onClick={() => controller.send({ type: 'SEARCH_SUBMIT' })}>SubmitSearch</button>
      <button onClick={() => controller.onPageChange(2)}>Page2</button>
      {controller.rows.map(r => (
        <button
          key={r.id}
          onClick={r.onRemove}
        >
          Remove {r.id}
        </button>
      ))}
    </div>
  );
}

describe('useOrganizationProfileMembersPanelController', () => {
  it('is loading until the session is loaded', () => {
    isSessionLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading until the organization is loaded', () => {
    isOrganizationLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is hidden when the user cannot read memberships', () => {
    permissions = [];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when there is no active organization', () => {
    organization = null;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('derives plain rows from the memberships resource', () => {
    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('rows')).toHaveTextContent('Alice Doe|Admin|true|false;Bob|Member|false|true');
  });

  it('reports canManage from the manage permission', () => {
    permissions = [READ];
    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('canManage')).toHaveTextContent('false');
  });

  it('commits the search query only on submit', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('ChangeSearch'));
    expect(screen.getByTestId('query')).toHaveTextContent('');

    fireEvent.click(screen.getByText('SubmitSearch'));
    expect(screen.getByTestId('query')).toHaveTextContent('z');
  });

  it('drives removal through destroy + revalidate', async () => {
    const gate = deferred<void>();
    destroy.mockReturnValue(gate.promise);

    render(<Harness />);

    fireEvent.click(screen.getByText('Remove mem_2'));
    expect(screen.getByTestId('state')).toHaveTextContent('removing');
    expect(destroy).toHaveBeenCalledTimes(1);

    await act(async () => {
      gate.resolve();
    });

    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  it('surfaces a removal error on the snapshot', async () => {
    const gate = deferred<void>();
    destroy.mockReturnValue(gate.promise);

    render(<Harness />);
    fireEvent.click(screen.getByText('Remove mem_2'));

    await act(async () => {
      gate.reject(new Error('cannot remove last admin'));
    });

    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('error')).toHaveTextContent('cannot remove last admin');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('fetches a new page via the memberships resource', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('Page2'));

    expect(fetchPage).toHaveBeenCalledWith(2);
  });
});
