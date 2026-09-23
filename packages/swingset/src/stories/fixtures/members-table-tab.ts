import type {
  MembersTableSort,
  MembersTableTabViewProps,
  OrganizationProfileMember,
} from '@clerk/mosaic/features/organization-profile/members-table-tab.types';
import { useLocale } from '@clerk/mosaic/localization';
import { useState } from 'react';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];
const exampleMembers = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Margaret Hamilton',
  'Edsger Dijkstra',
  'Barbara Liskov',
  'Donald Knuth',
  'Radia Perlman',
  'John McCarthy',
  'Frances Allen',
  'Ken Thompson',
].map((name, index) => ({
  id: `member-${index}`,
  name,
  email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
  joinedAt: Date.UTC(2026, 8, index + 1),
  role: index % 3 === 0 ? 'admin' : 'member',
  isCurrentUser: index === 0,
}));

export function useMembersTableFixture({ proposed = false, empty = false } = {}): MembersTableTabViewProps {
  const locale = useLocale();
  const [items, setItems] = useState(empty ? [] : exampleMembers);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sort, setSort] = useState<MembersTableSort | null>(null);
  const query = searchValue.trim().toLowerCase();
  const filtered = items.filter(item => `${item.name} ${item.email}`.toLowerCase().includes(query));
  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const comparison =
          sort.column === 'joinedAt' ? a.joinedAt - b.joinedAt : a[sort.column].localeCompare(b[sort.column]);
        return sort.direction === 'ascending' ? comparison : -comparison;
      })
    : filtered;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(sorted.length / pageSize)));
  const members: OrganizationProfileMember[] = sorted
    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map(item => ({
      ...item,
      joinedAtLabel: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(item.joinedAt),
      roleLabel: roles.find(role => role.value === item.role)?.label ?? item.role,
    }));
  return {
    members,
    roles,
    totalCount: sorted.length,
    page: currentPage,
    pageSize,
    searchValue,
    isLoading: false,
    onSearchChange: value => {
      setSearchValue(value);
      setPage(1);
    },
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onChangeRole: (id, role) => setItems(current => current.map(item => (item.id === id ? { ...item, role } : item))),
    onRemove: id => setItems(current => current.filter(item => item.id !== id)),
    onBulkAction: proposed ? () => undefined : undefined,
    sort,
    onSortChange: proposed
      ? next => {
          setSort(next);
          setPage(1);
        }
      : undefined,
  };
}
