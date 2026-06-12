import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { membersQuery } from '../data/members-query';
import { getMosaicQueryClient } from '../data/query-client';
import { useOrganization } from '../data/use-organization';

export function OrganizationMembers() {
  const { organization } = useOrganization(); // signal: which org's members to load
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    membersQuery(organization.id),
    getMosaicQueryClient(),
  );
  const members = data.pages.flatMap(page => page.members);

  return (
    <Box
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        gap: t.spacing(2),
      })}
    >
      {members.map(member => (
        <Box
          key={member.id}
          sx={t => ({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBlock: t.spacing(2),
          })}
        >
          <Box
            render={p => <span {...p} />}
            sx={t => t.text('sm')}
          >
            {member.name}
          </Box>
          <Box
            render={p => <span {...p} />}
            sx={t => ({ ...t.text('xs'), color: t.color.mutedForeground })}
          >
            {member.role}
          </Box>
        </Box>
      ))}
      {hasNextPage ? (
        <Button
          size='sm'
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </Button>
      ) : null}
    </Box>
  );
}
