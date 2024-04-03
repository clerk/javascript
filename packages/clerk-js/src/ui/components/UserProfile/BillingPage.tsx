import { useUser } from '@clerk/shared/react';

import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import { Header, withCardStateProvider } from '../../elements';
import { CurrentPlanSection } from './CurrentPlanSection';
import { PaymentMethodSection } from './PaymentMethodSection';

export const BillingPage = withCardStateProvider(() => {
  const { user } = useUser();

  const handleStartPortalSession = async () => {
    const res = await user?.createPortalSession({ returnUrl: window.location.href });
    window.location.href = res?.redirectUrl || '';
  };

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, color: t.colors.$colorText })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('billing')}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('userProfile.start.headerTitle__billing')}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h2'
          />
        </Header.Root>

        <Button
          variant='outline'
          onClick={handleStartPortalSession}
        >
          Manage billing info
        </Button>

        <CurrentPlanSection />
        <PaymentMethodSection />
      </Col>
    </Col>
  );
});
