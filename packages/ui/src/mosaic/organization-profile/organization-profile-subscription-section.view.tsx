import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { styles } from './organization-profile-billing.styles';

export interface OrganizationProfileSeatLineItem {
  id: string;
  label: string;
  amountLabel: string;
}

export interface OrganizationProfileSubscription {
  planName: string;
  statusLabel?: string;
  priceLabel: string;
  seatsUsed: number;
  seatsTotal: number;
  seatLineItems: OrganizationProfileSeatLineItem[];
}

export interface OrganizationProfileSubscriptionSectionViewProps {
  subscription: OrganizationProfileSubscription;
  onChangePlan?: () => void;
  onManagePlan?: () => void;
  onManageSeats?: () => void;
}

export function OrganizationProfileSubscriptionSectionView({
  subscription,
  onChangePlan,
  onManagePlan,
  onManageSeats,
}: OrganizationProfileSubscriptionSectionViewProps): ReactElement {
  return (
    <Section.Root>
      <Section.Title>Subscription</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label {...stylex.props(styles.planLabel)}>
                <span>{subscription.planName}</span>
                {subscription.statusLabel ? <Badge color='neutral'>{subscription.statusLabel}</Badge> : null}
              </Section.Label>
              <Section.Description>{subscription.priceLabel}</Section.Description>
            </Section.Content>
            {onChangePlan || onManagePlan ? (
              <Section.Actions>
                {onChangePlan ? (
                  <Button
                    color='neutral'
                    size='sm'
                    onClick={onChangePlan}
                  >
                    Change plan
                  </Button>
                ) : null}
                {onManagePlan ? (
                  <Button
                    aria-label='Manage subscription'
                    color='neutral'
                    shape='square'
                    size='sm'
                    touchTarget={false}
                    variant='ghost'
                    onClick={onManagePlan}
                  >
                    <Icon name='ellipsis' />
                  </Button>
                ) : null}
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
        <Section.Row>
          <Section.Item>
            <div {...stylex.props(styles.seats)}>
              <div {...stylex.props(styles.seatsHeader)}>
                <Section.Label>Seats</Section.Label>
                <div {...stylex.props(styles.seatsActions)}>
                  <span {...stylex.props(styles.seatsUsage)}>
                    {subscription.seatsUsed} of {subscription.seatsTotal} seats used
                  </span>
                  {onManageSeats ? (
                    <Button
                      color='neutral'
                      size='sm'
                      variant='outline'
                      onClick={onManageSeats}
                    >
                      Manage seats
                    </Button>
                  ) : null}
                </div>
              </div>
              <div {...stylex.props(styles.lineItems)}>
                {subscription.seatLineItems.map(item => (
                  <div
                    key={item.id}
                    {...stylex.props(styles.lineItem)}
                  >
                    <Section.Description>{item.label}</Section.Description>
                    <span {...stylex.props(styles.lineItemAmount)}>{item.amountLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}
