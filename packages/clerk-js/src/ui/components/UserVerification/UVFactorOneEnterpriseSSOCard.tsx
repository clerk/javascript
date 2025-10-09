import type { EnterpriseSSOFactor, SessionVerificationFirstFactor } from '@clerk/types';

import { Card, Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import { localizationKeys } from '../../customizables';

type UVFactorOneEnterpriseSSOCardProps = {
  currentFactor: EnterpriseSSOFactor;
  availableFactors: SessionVerificationFirstFactor[] | null;
};

export const UVFactorOneEnterpriseSSOCard = (_props: UVFactorOneEnterpriseSSOCardProps) => {
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          {/* TODO - Display headers depending on whether there's a single or multiple connections */}
          <Header.Title localizationKey={localizationKeys('reverification.enterprise_sso.title')} />
          <Header.Subtitle localizationKey={localizationKeys('reverification.enterprise_sso.subtitle')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        {/* TODO -> Display option to choose enterprise SSO */}
      </Card.Content>

      <Card.Footer />
    </Card.Root>
  );
};
