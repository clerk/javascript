import * as stylex from '@stylexjs/stylex';

import { Button } from '../components/button';
import { Section } from '../components/section';
import { styles } from './user-profile-billing-panel.styles';

export interface UserProfileSubscription {
  planName: string;
  priceLabel: string;
  totalDueLabel: string;
  renewsAtLabel: string;
}

export interface UserProfileSubscriptionSectionViewProps {
  subscription: UserProfileSubscription;
  onChangePlan?: () => void;
}

export function UserProfileSubscriptionSectionView({
  subscription,
  onChangePlan,
}: UserProfileSubscriptionSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>Subscription</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{subscription.planName}</Section.Label>
              <Section.Description>{subscription.priceLabel}</Section.Description>
            </Section.Content>
            {onChangePlan ? (
              <Section.Actions>
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={onChangePlan}
                >
                  Change plan
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Total due</Section.Label>
              <Section.Description>{subscription.renewsAtLabel}</Section.Description>
            </Section.Content>
            <Section.Actions>
              <span {...stylex.props(styles.amount)}>{subscription.totalDueLabel}</span>
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}
