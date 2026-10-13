import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { useStableOrder } from '../../primitives/hooks';
import { UserProfileProviderIcon } from './user-profile-provider-icon';

export interface UserProfilePaymentMethod {
  id: string;
  label: string;
  expiryLabel?: string;
  isDefault?: boolean;
  isRemovable?: boolean;
}

export interface UserProfilePaymentMethodsSectionViewProps {
  paymentMethods: UserProfilePaymentMethod[];
  onAdd?: () => void;
  onMakeDefault?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const byId = (paymentMethod: UserProfilePaymentMethod) => paymentMethod.id;

export function UserProfilePaymentMethodsSectionView({
  paymentMethods,
  onAdd,
  onMakeDefault,
  onRemove,
}: UserProfilePaymentMethodsSectionViewProps) {
  const ordered = useStableOrder(paymentMethods, byId);
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>Payment methods</Section.Title>
          </Section.Content>
          {onAdd ? (
            <Section.Actions>
              <Button
                aria-label='Add payment method'
                color='neutral'
                size='sm'
                variant='outline'
                onClick={onAdd}
              >
                <Icon
                  name='plus'
                  placement='inline-start'
                  size='sm'
                />
                Add
              </Button>
            </Section.Actions>
          ) : null}
        </Section.Header>
        <Section.Body>
          <Section.AnimatedItems
            items={ordered}
            getKey={byId}
            empty={
              <Section.Content>
                <Section.Description>No payment methods added</Section.Description>
              </Section.Content>
            }
          >
            {paymentMethod => (
              <PaymentMethodItem
                paymentMethod={paymentMethod}
                onMakeDefault={onMakeDefault}
                onRemove={onRemove}
              />
            )}
          </Section.AnimatedItems>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

function PaymentMethodItem({
  paymentMethod,
  onMakeDefault,
  onRemove,
}: {
  paymentMethod: UserProfilePaymentMethod;
  onMakeDefault?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const actions: ActionMenuAction[] = [];

  if (!paymentMethod.isDefault && onMakeDefault) {
    actions.push({ label: 'Make default', onClick: () => onMakeDefault(paymentMethod.id) });
  }
  if (paymentMethod.isRemovable !== false && onRemove) {
    actions.push({ label: 'Remove payment method', color: 'negative', onClick: () => onRemove(paymentMethod.id) });
  }

  return (
    <>
      <UserProfileProviderIcon name='credit-card' />
      <Section.Content>
        <Section.Label>
          {paymentMethod.label} {paymentMethod.isDefault ? <Badge color='neutral'>Default</Badge> : null}
        </Section.Label>
        {paymentMethod.expiryLabel ? <Section.Description>{paymentMethod.expiryLabel}</Section.Description> : null}
      </Section.Content>
      <Section.Actions>
        <ActionMenu
          actions={actions}
          label={`Manage ${paymentMethod.label}`}
        />
      </Section.Actions>
    </>
  );
}
