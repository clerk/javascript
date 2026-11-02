import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { InviteMembersButtonView } from '@clerk/mosaic/features/invite-members-button/invite-members-button.view';
import { Plus } from '@clerk/mosaic/icons/glyphs/plus';

import type { StoryMeta } from '@/lib/types';

import { useInviteMembersFixture } from './fixtures/organization-profile-invite-members';

export { default as __source } from './invite-members-button.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'InviteMembersButton',
  label: 'Invite members button',
  status: 'stable',
  source: 'packages/mosaic/src/features/invite-members-button/invite-members-button.tsx',
};

export function Default(_args: Record<string, unknown>) {
  const invite = useInviteMembersFixture();

  return <InviteMembersButtonView {...invite} />;
}

export function CustomElement(_args: Record<string, unknown>) {
  const invite = useInviteMembersFixture();

  return (
    <InviteMembersButtonView
      {...invite}
      render={
        <Button
          variant='outline'
          color='neutral'
        />
      }
    >
      <Icon glyph={Plus} />
      Add teammates
    </InviteMembersButtonView>
  );
}

export function Unavailable(_args: Record<string, unknown>) {
  const { onInvite } = useInviteMembersFixture();

  return (
    <InviteMembersButtonView
      onInvite={onInvite}
      isInviteDisabled
      render={<Button />}
    />
  );
}
