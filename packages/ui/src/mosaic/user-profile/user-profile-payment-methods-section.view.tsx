import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
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

export function UserProfilePaymentMethodsSectionView({
  paymentMethods,
  onAdd,
  onMakeDefault,
  onRemove,
}: UserProfilePaymentMethodsSectionViewProps) {
  return (
    <Section.Root aria-label='Payment methods'>
      <Section.Group>
        <Section.Row variant='list'>
          <Section.Item>
            <Section.Content>
              <Section.Label>Payment methods</Section.Label>
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
          </Section.Item>
          <Section.Items>
            {paymentMethods.length > 0 ? (
              paymentMethods.map(paymentMethod => (
                <PaymentMethodItem
                  key={paymentMethod.id}
                  paymentMethod={paymentMethod}
                  onMakeDefault={onMakeDefault}
                  onRemove={onRemove}
                />
              ))
            ) : (
              <Section.Item>
                <Section.Content>
                  <Section.Description>No payment methods added</Section.Description>
                </Section.Content>
              </Section.Item>
            )}
          </Section.Items>
        </Section.Row>
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
  const actions: UserProfileMenuAction[] = [];

  if (!paymentMethod.isDefault && onMakeDefault) {
    actions.push({ label: 'Make default', onClick: () => onMakeDefault(paymentMethod.id) });
  }
  if (paymentMethod.isRemovable !== false && onRemove) {
    actions.push({ label: 'Remove payment method', color: 'negative', onClick: () => onRemove(paymentMethod.id) });
  }

  return (
    <Section.Item>
      <UserProfileProviderIcon name='credit-card' />
      <Section.Content>
        <Section.Label>
          {paymentMethod.label} {paymentMethod.isDefault ? <Badge color='neutral'>Default</Badge> : null}
        </Section.Label>
        {paymentMethod.expiryLabel ? <Section.Description>{paymentMethod.expiryLabel}</Section.Description> : null}
      </Section.Content>
      <Section.Actions>
        <UserProfileActionMenu
          actions={actions}
          label={`Manage ${paymentMethod.label}`}
        />
      </Section.Actions>
    </Section.Item>
  );
}
