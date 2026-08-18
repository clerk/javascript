import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Heading } from '../components/heading';
import { mergeStyleProps, themeProps } from '../props';
import type {
  UserProfileBillingHistoryItem,
  UserProfileBillingHistoryPagination,
} from './user-profile-billing-history-section.view';
import { UserProfileBillingHistorySectionView } from './user-profile-billing-history-section.view';
import { styles } from './user-profile-billing-panel.styles';
import type { UserProfilePaymentMethod } from './user-profile-payment-methods-section.view';
import { UserProfilePaymentMethodsSectionView } from './user-profile-payment-methods-section.view';
import type { UserProfileSubscription } from './user-profile-subscription-section.view';
import { UserProfileSubscriptionSectionView } from './user-profile-subscription-section.view';

export type {
  UserProfileBillingHistoryItem,
  UserProfileBillingHistoryPagination,
  UserProfilePaymentMethod,
  UserProfileSubscription,
};

export interface UserProfileBillingPanelViewProps {
  subscription: UserProfileSubscription;
  paymentMethods: UserProfilePaymentMethod[];
  historyItems: UserProfileBillingHistoryItem[];
  historyPagination?: UserProfileBillingHistoryPagination;
  onChangePlan?: () => void;
  onAddPaymentMethod?: () => void;
  onMakeDefaultPaymentMethod?: (id: string) => void;
  onRemovePaymentMethod?: (id: string) => void;
  onBillingHistoryPageChange?: (page: number) => void;
  onBillingHistoryPageSizeChange?: (pageSize: number) => void;
  onViewInvoice?: (id: string) => void;
}

export function UserProfileBillingPanelView({
  subscription,
  paymentMethods,
  historyItems,
  historyPagination,
  onChangePlan,
  onAddPaymentMethod,
  onMakeDefaultPaymentMethod,
  onRemovePaymentMethod,
  onBillingHistoryPageChange,
  onBillingHistoryPageSizeChange,
  onViewInvoice,
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
        <UserProfileBillingHistorySectionView
          items={historyItems}
          pagination={historyPagination}
          onPageChange={onBillingHistoryPageChange}
          onPageSizeChange={onBillingHistoryPageSizeChange}
          onView={onViewInvoice}
        />
      </div>
    </div>
  );
}
