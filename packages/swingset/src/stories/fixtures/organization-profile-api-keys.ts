import type {
  OrganizationProfileAPIKeySort,
  OrganizationProfileApiKeysPanelViewProps,
} from '@clerk/mosaic/features/organization-profile/organization-profile-api-keys-panel.types';
import type { OrganizationProfileCreateAPIKeyDialogProps } from '@clerk/mosaic/features/organization-profile/organization-profile-create-api-key.dialog';
import { useLocale, useMessages } from '@clerk/mosaic/localization';
import { useEffect, useRef, useState } from 'react';

interface FixtureAPIKey {
  id: string;
  name: string;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
}

const exampleTime = Date.now();

export const exampleAPIKeys: FixtureAPIKey[] = [
  'Web app',
  'Mobile app',
  'CI pipeline',
  'Analytics',
  'Billing service',
  'Integrations',
  'Reports',
  'Support tools',
  'Monitoring',
  'Backups',
  'Staging',
  'Local development',
].map((name, index) => ({
  id: `ak_example${String(index + 1).padStart(16, '0')}`,
  name,
  createdAt: Date.UTC(2026, 0, index + 5),
  expiresAt: index % 2 === 0 ? Date.UTC(2027, 11, 31) : null,
  lastUsedAt: index % 3 === 0 ? exampleTime - (index + 2) * 60_000 : null,
}));

function getExpirationDate(expiration: OrganizationProfileCreateAPIKeyDialogProps['expiration'], now = new Date()) {
  if (expiration === null || expiration === 'never') {
    return null;
  }
  const date = new Date(now);
  if (expiration === '1y') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    const days = { '1d': 1, '7d': 7, '30d': 30, '60d': 60, '90d': 90, '180d': 180 };
    date.setDate(date.getDate() + days[expiration]);
  }
  return date;
}

function sortAPIKeys(items: FixtureAPIKey[], sort: OrganizationProfileAPIKeySort | null) {
  if (!sort) {
    return items;
  }
  const direction = sort.direction === 'ascending' ? 1 : -1;
  return [...items].sort((a, b) => {
    if (sort.column === 'name') {
      return direction * a.name.localeCompare(b.name);
    }
    if (sort.column === 'createdAt') {
      return direction * (a.createdAt - b.createdAt);
    }
    if (a.lastUsedAt === null) {
      return b.lastUsedAt === null ? 0 : 1;
    }
    if (b.lastUsedAt === null) {
      return -1;
    }
    return direction * (a.lastUsedAt - b.lastUsedAt);
  });
}

export async function createExampleAPIKey() {
  await new Promise<void>(resolve => setTimeout(resolve, 600));
  return { id: `ak_demo_${crypto.randomUUID()}`, secret: `ak_demo_${crypto.randomUUID()}` };
}

export async function revokeExampleAPIKey() {
  await new Promise<void>(resolve => setTimeout(resolve, 600));
}

export function useOrganizationProfileAPIKeysFixture({
  initialKeys = exampleAPIKeys,
  enableSorting = false,
  createKey = createExampleAPIKey,
  copyKey = (secret: string) => navigator.clipboard.writeText(secret),
  revokeKey = revokeExampleAPIKey,
}: {
  initialKeys?: FixtureAPIKey[];
  enableSorting?: boolean;
  createKey?: (input: {
    name: string;
    expiration: OrganizationProfileCreateAPIKeyDialogProps['expiration'];
  }) => Promise<{ id: string; secret: string }>;
  copyKey?: (secret: string) => Promise<void>;
  revokeKey?: (id: string) => Promise<void>;
} = {}): OrganizationProfileApiKeysPanelViewProps {
  const m = useMessages('organizationProfileApiKeysPanel');
  const locale = useLocale();
  const [items, setItems] = useState(initialKeys);
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<OrganizationProfileAPIKeySort | null>(null);
  const createTrigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState<OrganizationProfileCreateAPIKeyDialogProps['expiration']>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const dateLabel = (date: Date | number) =>
    new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  const relativeTime = new Intl.RelativeTimeFormat(locale);

  const expirationDate = getExpirationDate(expiration);

  useEffect(() => {
    const next = searchValue.trim();
    if (next === query) {
      return;
    }
    const timer = setTimeout(() => {
      setQuery(next);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, query]);

  const filtered = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  const sorted = sortAPIKeys(filtered, sort);
  const pageCount = Math.ceil(filtered.length / pageSize);
  useEffect(() => {
    if (page > Math.max(1, pageCount)) {
      setPage(Math.max(1, pageCount));
    }
  }, [page, pageCount]);

  return {
    apiKeys: sorted.slice((page - 1) * pageSize, page * pageSize).map(item => ({
      id: item.id,
      name: item.name,
      createdAtLabel: dateLabel(item.createdAt),
      expiresAtLabel: item.expiresAt === null ? null : dateLabel(item.expiresAt),
      lastUsedAtLabel:
        item.lastUsedAt === null
          ? null
          : relativeTime.format(Math.round((item.lastUsedAt - exampleTime) / 60_000), 'minute'),
    })),
    totalCount: filtered.length,
    page,
    pageSize,
    searchValue,
    isLoading: false,
    onCreate: event => {
      createTrigger.current = event.currentTarget;
      setName('');
      setExpiration(null);
      setSecret(null);
      setError(null);
      setOpen(true);
    },
    createDialog: {
      open,
      onOpenChange: setOpen,
      finalFocus: createTrigger,
      name,
      onNameChange: setName,
      expiration,
      expirationDateLabel: expirationDate ? dateLabel(expirationDate) : null,
      onExpirationChange: setExpiration,
      secret,
      isPending,
      error,
      onSubmit: async () => {
        if (!name.trim() || expiration === null || isPending) {
          return;
        }
        setIsPending(true);
        setError(null);
        try {
          const result = await createKey({ name: name.trim(), expiration });
          const createdAt = new Date();
          const expiresAt = getExpirationDate(expiration, createdAt);
          setItems(current => [
            {
              id: result.id,
              name: name.trim(),
              createdAt: createdAt.getTime(),
              expiresAt: expiresAt?.getTime() ?? null,
              lastUsedAt: null,
            },
            ...current,
          ]);
          setSecret(result.secret);
        } catch (error) {
          setError(error instanceof Error ? error.message : m.createError);
        } finally {
          setIsPending(false);
        }
      },
      onCopy: async close => {
        if (!secret || isPending) {
          return;
        }
        setIsPending(true);
        setError(null);
        try {
          await copyKey(secret);
          if (close) {
            setOpen(false);
          }
        } catch (error) {
          setError(m.copyError);
          if (!close) {
            throw error;
          }
        } finally {
          setIsPending(false);
        }
      },
    },
    onSearchChange: setSearchValue,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    sort: enableSorting ? sort : undefined,
    onSortChange: enableSorting
      ? next => {
          setSort(next);
          setPage(1);
        }
      : undefined,
    onRevoke: async id => {
      await revokeKey(id);
      setItems(current => current.filter(item => item.id !== id));
    },
  };
}
