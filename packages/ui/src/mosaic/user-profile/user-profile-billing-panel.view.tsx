import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Heading } from '../components/heading';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './user-profile-billing-panel.styles';
import type { UserProfilePaymentMethod } from './user-profile-payment-methods-section.view';
import { UserProfilePaymentMethodsSectionView } from './user-profile-payment-methods-section.view';
import type { UserProfileSubscription } from './user-profile-subscription-section.view';
import { UserProfileSubscriptionSectionView } from './user-profile-subscription-section.view';

export type { UserProfilePaymentMethod, UserProfileSubscription };

export interface UserProfileBillingPanelViewProps {
  subscription: UserProfileSubscription;
  paymentMethods: UserProfilePaymentMethod[];
  onChangePlan?: () => void;
  onAddPaymentMethod?: () => void;
  onMakeDefaultPaymentMethod?: (id: string) => void;
  onRemovePaymentMethod?: (id: string) => void;
}

export function UserProfileBillingPanelView({
  subscription,
  paymentMethods,
  onChangePlan,
  onAddPaymentMethod,
  onMakeDefaultPaymentMethod,
  onRemovePaymentMethod,
}: UserProfileBillingPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('user-profile-billing-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        Billing
      </Heading>
      <div {...stylex.props(styles.sections)}>
        <UserProfileSubscriptionSectionView
          subscription={subscription}
          onChangePlan={onChangePlan}
        />
        <UserProfilePaymentMethodsSectionView
          paymentMethods={paymentMethods}
          onAdd={onAddPaymentMethod}
          onMakeDefault={onMakeDefaultPaymentMethod}
          onRemove={onRemovePaymentMethod}
        />
      </div>
    </div>
  );
}
