import { iconImageUrl } from '@clerk/shared/constants';
import type { OAuthProvider, OidcIdpSlug, SamlIdpSlug } from '@clerk/shared/types';
import { useState } from 'react';

import { ProviderIcon } from '@/common';
import { Col, localizationKeys, Text } from '@/customizables';
import { Drawer } from '@/elements/Drawer';
import { IconButton } from '@/elements/IconButton';

type ConfigureEnterpriseConnectionDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ConfigureEnterpriseConnectionDrawer = (props: ConfigureEnterpriseConnectionDrawerProps) => {
  const { open, onOpenChange } = props;
  const [provider, setProvider] = useState<EnterpriseConnectionProviderSlug | null>(null);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header title={localizationKeys('configureSSO.enterpriseConnectionDrawer.title')} />
        <Drawer.Body>
          {provider ? (
            <Col>
              <Text>{provider}</Text>
            </Col>
          ) : (
            <Col
              gap={4}
              sx={t => ({ padding: t.space.$4 })}
            >
              <Col gap={2}>
                <Text
                  localizationKey={localizationKeys('configureSSO.enterpriseConnectionDrawer.selectProviderTitle')}
                />
                <Text
                  colorScheme='secondary'
                  variant='body'
                  localizationKey={localizationKeys(
                    'configureSSO.enterpriseConnectionDrawer.selectProviderDescription',
                  )}
                />
              </Col>

              <Col gap={3}>
                <Text variant='subtitle'>SAML</Text>

                <EnterpriseConnectionProviderButton
                  provider='saml_okta'
                  onClick={() => setProvider('saml_okta')}
                />
                <EnterpriseConnectionProviderButton
                  provider='saml_custom'
                  onClick={() => setProvider('saml_custom')}
                />
              </Col>

              <Col gap={3}>
                <Text variant='subtitle'>OpenID Connect (OIDC)</Text>
                <EnterpriseConnectionProviderButton
                  provider='oidc_custom'
                  onClick={() => setProvider('oidc_custom')}
                />
              </Col>
            </Col>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

type EnterpriseConnectionProviderSlug = Extract<SamlIdpSlug, 'saml_okta' | 'saml_custom'> | OidcIdpSlug;

type EnterpriseConnectionProviderButtonProps = {
  provider: EnterpriseConnectionProviderSlug;
  onClick: () => void;
};

const providerButtons: Record<EnterpriseConnectionProviderSlug, { iconUrl: string; name: string }> = {
  saml_okta: {
    iconUrl: iconImageUrl('okta', 'svg'),
    name: 'Okta Workforce',
  },
  saml_custom: {
    iconUrl: iconImageUrl('saml', 'svg'),
    name: 'Custom SAML Provider',
  },
  oidc_custom: {
    iconUrl: iconImageUrl('oidc', 'svg'),
    name: 'Custom OIDC Provider',
  },
} as const;

const EnterpriseConnectionProviderButton = (props: EnterpriseConnectionProviderButtonProps) => {
  const { provider, onClick } = props;

  const providerWithoutPrefix = provider.replace(/(oauth_|saml_)/, '').trim() as OAuthProvider;
  const { iconUrl, name } = providerButtons[provider];

  return (
    <IconButton
      sx={t => ({ gap: t.space.$2, justifyContent: 'flex-start', padding: t.space.$4 })}
      type='button'
      onClick={onClick}
      variant='outline'
      icon={
        <ProviderIcon
          id={providerWithoutPrefix}
          iconUrl={iconUrl}
          name={name}
          alt={`${name} icon`}
        />
      }
      aria-label={name}
    >
      <Text>{name}</Text>
    </IconButton>
  );
};
