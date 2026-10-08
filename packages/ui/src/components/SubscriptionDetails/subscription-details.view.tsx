import type { ReactNode } from 'react';

import { Drawer } from '@/ui/elements/Drawer';

import { localizationKeys, Spinner } from '../../customizables';
import type { SubscriptionDetailsViewData } from './subscription-details.types';

export const SubscriptionDetailsView = ({
  controller,
  cards,
  footer,
}: {
  controller: SubscriptionDetailsViewData;
  cards: ReactNode;
  footer: ReactNode;
}) => {
  if (controller.isLoading) {
    return <Spinner sx={{ margin: 'auto' }} />;
  }

  if (!controller.hasSubscription) {
    return null;
  }

  return (
    <>
      <Drawer.Header title={localizationKeys('billing.subscriptionDetails.title')} />
      <Drawer.Body
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflowY: 'auto',
          padding: t.space.$4,
          gap: t.space.$4,
        })}
      >
        {cards}
      </Drawer.Body>
      {footer}
    </>
  );
};
