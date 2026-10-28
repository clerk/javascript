import type { UserAvatarViewProps } from '@clerk/mosaic/features/user-avatar/user-avatar.view';
import { UserAvatarView } from '@clerk/mosaic/features/user-avatar/user-avatar.view';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName } from '@/lib/chaos';
import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-avatar.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'UserAvatar',
  label: 'User avatar',
  status: 'stable',
  source: 'packages/mosaic/src/features/user-avatar/user-avatar.tsx',
};

const cameron: UserAvatarViewProps = {
  name: 'Cameron Walker',
  initials: 'CW',
  imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
};

function chaosUser(user: UserAvatarViewProps): UserAvatarViewProps {
  const name = chaosName(0);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
  return { ...user, name, initials };
}

function useUser() {
  return useChaosFixture(cameron, chaosUser);
}

export function Default(_args: Record<string, unknown>) {
  const user = useUser();

  return <UserAvatarView {...user} />;
}

export function NoImage(_args: Record<string, unknown>) {
  const user = useUser();

  return (
    <UserAvatarView
      {...user}
      imageUrl={undefined}
    />
  );
}

export function Shapes(_args: Record<string, unknown>) {
  const user = useUser();

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <UserAvatarView
        {...user}
        shape='circle'
      />
      <UserAvatarView
        {...user}
        shape='square'
      />
    </div>
  );
}

export function Sizes(_args: Record<string, unknown>) {
  const user = useUser();

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
        <UserAvatarView
          key={size}
          {...user}
          size={size}
        />
      ))}
    </div>
  );
}
