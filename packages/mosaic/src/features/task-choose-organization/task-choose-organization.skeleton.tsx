import { Card } from '../../components/card';
import { Item } from '../../components/item';
import { Skeleton } from '../../components/skeleton';
import { RowAvatar } from '../../components/switcher/switcher-avatar';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useMessages } from '../../localization';
import { TaskChooseOrganizationHeader, TaskChooseOrganizationSignOut } from './task-choose-organization.view';

const PLACEHOLDER_ORGANIZATIONS = ['Acme Corporation', 'Globex'];

interface TaskChooseOrganizationSkeletonStepsProps {
  canCreate: boolean;
  identifier?: string;
}

export function TaskChooseOrganizationSkeleton({
  renderBranding,
  ...props
}: TaskChooseOrganizationSkeletonStepsProps & { renderBranding: boolean }) {
  return (
    <Card.Root renderBranding={renderBranding}>
      <TaskChooseOrganizationSkeletonSteps {...props} />
    </Card.Root>
  );
}

export function TaskChooseOrganizationSkeletonSteps({
  canCreate,
  identifier,
}: TaskChooseOrganizationSkeletonStepsProps) {
  const m = useMessages('organizationList');
  return (
    <>
      <TaskChooseOrganizationHeader canCreate={canCreate} />
      <Card.Content>
        <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
        <Item.Group aria-hidden>
          {PLACEHOLDER_ORGANIZATIONS.map(name => (
            <Item.Root key={name}>
              <Skeleton shape='rounded'>
                <Item.Media>
                  <RowAvatar
                    name={name}
                    shape='square'
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
          ))}
        </Item.Group>
      </Card.Content>
      <TaskChooseOrganizationSignOut identifier={identifier} />
    </>
  );
}
