import { Col, descriptors, localizationKeys } from '../../customizables';
import { Header, withCardStateProvider } from '../../elements';
import { CurrentPlanSection } from './CurrentPlanSection';

export const BillingPage = withCardStateProvider(() => {
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

        <CurrentPlanSection />
      </Col>
    </Col>
  );
});
