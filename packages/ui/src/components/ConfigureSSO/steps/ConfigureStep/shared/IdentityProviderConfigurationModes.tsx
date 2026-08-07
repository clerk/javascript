import { type JSX } from 'react';

import { type LocalizationKey, useLocalizations } from '@/customizables';
import { SegmentedControl } from '@/elements/SegmentedControl';

export type SamlIdpConfigurationMode = 'metadataUrl' | 'metadataFile' | 'manual';
export type OidcIdpConfigurationMode = 'discoveryUrl' | 'manual';

type IdentityProviderConfigurationModesProps<Mode extends string> = {
  modes: readonly Mode[];
  value: Mode;
  onChange: (mode: Mode) => void;
  labels: {
    ariaLabel: LocalizationKey;
  } & Partial<Record<Mode, LocalizationKey>>;
};

export const IdentityProviderConfigurationModes = <Mode extends string>({
  modes,
  value,
  onChange,
  labels,
}: IdentityProviderConfigurationModesProps<Mode>): JSX.Element => {
  const { t } = useLocalizations();

  return (
    <SegmentedControl.Root
      aria-label={t(labels.ariaLabel)}
      value={value}
      onChange={next => onChange(next as Mode)}
      fullWidth
      size='lg'
    >
      {modes.map(mode => {
        const label = labels[mode];
        if (!label) {
          return null;
        }

        return (
          <SegmentedControl.Button
            key={mode}
            value={mode}
            text={label}
          />
        );
      })}
    </SegmentedControl.Root>
  );
};
