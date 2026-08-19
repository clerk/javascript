import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { styles } from './organization-profile-billing.styles';

export interface OrganizationProfilePaymentMethod {
  id: string;
  label: string;
  expiryLabel: string;
  iconUrl?: string;
  isDefault?: boolean;
}

export interface OrganizationProfilePaymentMethodsSectionViewProps {
  paymentMethods: OrganizationProfilePaymentMethod[];
  onAdd?: () => void;
  onManage?: (id: string) => void;
}

export function OrganizationProfilePaymentMethodsSectionView({
  paymentMethods,
  onAdd,
  onManage,
}: OrganizationProfilePaymentMethodsSectionViewProps): ReactElement {
  return (
    <Section.Root>
      <Section.Title>Payment</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Payment methods</Section.Label>
            </Section.Content>
            {onAdd ? (
              <Section.Actions>
                <Button
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
                <Section.Item key={paymentMethod.id}>
                  {/* TODO: Temporary provider-media frame; replace with Mosaic IconFrame while preserving image and fallback icons. */}
                  <Section.Media
                    size='lg'
                    {...stylex.props(styles.iconFrame)}
                  >
                    {paymentMethod.iconUrl ? (
                      <img
                        alt=''
                        src={paymentMethod.iconUrl}
                        {...stylex.props(styles.icon)}
                      />
                    ) : (
                      <Icon
                        aria-hidden
                        name='credit-card'
                        {...stylex.props(styles.icon)}
                      />
                    )}
                  </Section.Media>
                  <Section.Content>
                    <Section.Label>
                      {paymentMethod.label} {paymentMethod.isDefault ? <Badge color='neutral'>Default</Badge> : null}
                    </Section.Label>
                    <Section.Description>{paymentMethod.expiryLabel}</Section.Description>
                  </Section.Content>
                  {onManage ? (
                    <Section.Actions>
                      <Button
                        aria-label={`Manage ${paymentMethod.label}`}
                        color='neutral'
                        shape='square'
                        size='sm'
                        touchTarget={false}
                        variant='ghost'
                        onClick={() => onManage(paymentMethod.id)}
                      >
                        <Icon name='ellipsis' />
                      </Button>
                    </Section.Actions>
                  ) : null}
                </Section.Item>
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
