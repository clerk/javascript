import { ClipboardInput } from '@/elements/ClipboardInput';
import { ProfileSection } from '@/elements/Section';
import { Checkmark, Clipboard } from '@/icons';

import type { LocalizationKey } from '../../../customizables';
import { Col, localizationKeys, Text, useLocalizations } from '../../../customizables';
import type { ServiceProviderValue } from './service-provider-section.model';

export const ServiceProviderSectionView = ({
  values,
}: {
  values: ServiceProviderValue[] | null;
}): JSX.Element | null => {
  if (!values) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.title')}
      id='ssoConnectionServiceProvider'
      centered={false}
    >
      <Col gap={4}>
        {values.map(({ label, value }) => (
          <CopyableValue
            key={label.key}
            label={label}
            value={value}
          />
        ))}
      </Col>
    </ProfileSection.Root>
  );
};

const CopyableValue = ({ label, value }: { label: LocalizationKey; value: string }): JSX.Element => {
  const { t } = useLocalizations();
  return (
    <Col gap={1}>
      <Text
        colorScheme='secondary'
        variant='caption'
        localizationKey={label}
      />
      <ClipboardInput
        value={value}
        readOnly
        aria-label={t(label)}
        copyIcon={Clipboard}
        copiedIcon={Checkmark}
      />
    </Col>
  );
};
