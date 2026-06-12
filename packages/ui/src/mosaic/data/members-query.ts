import { infiniteQueryOptions } from '@tanstack/react-query';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Server collection: the org's members, paginated. This is the half that genuinely wants
 * TanStack — caching, staleness, infinite pagination, invalidation — none of which a signal
 * gives you. A colocated query-options factory is the unit of reuse: the same `membersQuery(id)`
 * feeds suspense reads, prefetch, and tests.
 */

export const membersKey = (orgId: string) => ['org', orgId, 'members'] as const;

export interface MemberRecord {
  id: string;
  name: string;
  role: string;
}

interface MembersPage {
  members: MemberRecord[];
  nextPage: number | null;
}

const PAGE_SIZE = 3;
const TOTAL_PAGES = 3;

export const membersQuery = (orgId: string) =>
  infiniteQueryOptions({
    queryKey: membersKey(orgId),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<MembersPage> => {
      await delay(500);
      const base = (pageParam - 1) * PAGE_SIZE;
      const members = Array.from({ length: PAGE_SIZE }, (_, i) => ({
        id: `mem_${base + i}`,
        name: `Member ${base + i + 1}`,
        role: base + i === 0 ? 'org:admin' : 'org:member',
      }));
      return { members, nextPage: pageParam < TOTAL_PAGES ? pageParam + 1 : null };
    },
    getNextPageParam: last => last.nextPage,
    staleTime: 60_000,
  });
