import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Heading } from '../components/heading';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './organization-profile-billing.styles';
import type { OrganizationProfileInvoicesSectionViewProps } from './organization-profile-invoices-section.view';
import { OrganizationProfileInvoicesSectionView } from './organization-profile-invoices-section.view';
import type { OrganizationProfilePaymentMethodsSectionViewProps } from './organization-profile-payment-methods-section.view';
import { OrganizationProfilePaymentMethodsSectionView } from './organization-profile-payment-methods-section.view';
import type { OrganizationProfileSubscriptionSectionViewProps } from './organization-profile-subscription-section.view';
import { OrganizationProfileSubscriptionSectionView } from './organization-profile-subscription-section.view';

export interface OrganizationProfileBillingPanelViewProps {
  subscription: OrganizationProfileSubscriptionSectionViewProps;
  paymentMethods: OrganizationProfilePaymentMethodsSectionViewProps;
  invoices: OrganizationProfileInvoicesSectionViewProps;
}

export function OrganizationProfileBillingPanelView({
  subscription,
  paymentMethods,
  invoices,
}: OrganizationProfileBillingPanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('organization-profile-billing-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='2xl'
      >
        Billing
      </Heading>
      <div {...stylex.props(styles.sections)}>
        <OrganizationProfileSubscriptionSectionView {...subscription} />
        <OrganizationProfilePaymentMethodsSectionView {...paymentMethods} />
        <OrganizationProfileInvoicesSectionView {...invoices} />
      </div>
    </div>
  );
}
