import { useMembersSearchController } from './members-search.controller';
import type { MembersSearchProps } from './members-search.types';
import { MembersSearchView } from './members-search.view';
import { ACTIVE_MEMBERS_PAGE_SIZE } from './organization-members.constants';

export type { MembersSearchProps } from './members-search.types';

export const MembersSearch = (props: MembersSearchProps) => {
  const data = useMembersSearchController(props, ACTIVE_MEMBERS_PAGE_SIZE);
  return <MembersSearchView data={data} />;
};
