import { Card } from '../../components/card';
import { Item } from '../../components/item';
import { Skeleton } from '../../components/skeleton';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useMessages } from '../../localization';
import { RowAvatar } from '../switcher/switcher-avatar.view';
import type { OrganizationListData } from './organization-list.types';
import { OrganizationListHeader } from './organization-list.view';

const PLACEHOLDER_ORGANIZATIONS = ['Acme Corporation', 'Globex', 'Initech Labs'];

export function OrganizationListSkeleton({
  hidePersonal,
  applicationName,
  renderBranding,
}: Pick<OrganizationListData, 'hidePersonal' | 'applicationName' | 'renderBranding'>) {
  const m = useMessages('organizationList');
  return (
    <Card.Root renderBranding={renderBranding}>
      <OrganizationListHeader
        hidePersonal={hidePersonal}
        applicationName={applicationName}
      />
      <Card.Content>
        <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
        <Item.Group
          variant='outline'
          aria-hidden
        >
          {hidePersonal ? null : (
            <SkeletonRow
              name={m.personal}
              shape='circle'
            />
          )}
          {PLACEHOLDER_ORGANIZATIONS.map(name => (
            <SkeletonRow
              key={name}
              name={name}
              shape='square'
            />
          ))}
        </Item.Group>
      </Card.Content>
    </Card.Root>
  );
}

function SkeletonRow({ name, shape }: { name: string; shape: 'circle' | 'square' }) {
  return (
    <Item.Root>
      <Skeleton shape={shape === 'circle' ? 'pill' : 'rounded'}>
        <Item.Media>
          <RowAvatar
            name={name}
            shape={shape}
            size='fit'
          />
        </Item.Media>
      </Skeleton>
      <Item.Content>
        <Item.Label>
          <Skeleton>{name}</Skeleton>
        </Item.Label>
      </Item.Content>
    </Item.Root>
  );
}
