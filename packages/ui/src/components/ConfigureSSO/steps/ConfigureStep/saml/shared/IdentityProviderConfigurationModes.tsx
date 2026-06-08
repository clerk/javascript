import { type JSX } from 'react';

import { type LocalizationKey, useLocalizations } from '@/customizables';
import { SegmentedControl } from '@/elements/SegmentedControl';

/**
 * The possible modes for the identity provider configuration
 *
 * metadataUrl: Fetch IdP configuration via metadata URL
 * metadataFile: Upload IdP configuration via metadata file
 * manual: Configure manually each field, such as sign on URL, issuer, and signing certificate
 */
export type IdpConfigurationMode = 'metadataUrl' | 'metadataFile' | 'manual';

type ModeLocalizationKeys = Partial<Record<IdpConfigurationMode, LocalizationKey>>;

type IdentityProviderConfigurationModesProps = {
  /**
   * The set of modes to render as segments, in display order
   */
  modes: readonly IdpConfigurationMode[];
  /**
   * The currently controlled selected mode state
   */
  value: IdpConfigurationMode;
  /**
   * Called when the user selects a different mode
   */
  onChange: (mode: IdpConfigurationMode) => void;
  /**
   * Localization keys for the aria label and each mode button
   */
  labels: {
    ariaLabel: LocalizationKey;
  } & ModeLocalizationKeys;
};

export const IdentityProviderConfigurationModes = ({
  modes,
  value,
  onChange,
  labels,
}: IdentityProviderConfigurationModesProps): JSX.Element => {
  const { t } = useLocalizations();

  return (
    <SegmentedControl.Root
      aria-label={t(labels.ariaLabel)}
      value={value}
      onChange={next => onChange(next as IdpConfigurationMode)}
      fullWidth
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
