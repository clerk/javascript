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
          {PLACEHOLDER_ORGANIZATIONS.map(name => (
            <Item.Root key={name}>
              <Item.Media>
                <Skeleton>
                  <RowAvatar
                    name={name}
                    shape='square'
                    size='fit'
                  />
                </Skeleton>
              </Item.Media>
              <Item.Content>
                <Item.Label>
                  <Skeleton>{name}</Skeleton>
                </Item.Label>
              </Item.Content>
            </Item.Root>
          ))}
        </Item.Group>
      </Card.Content>
    </Card.Root>
  );
}
