import { iconImageUrl } from '@clerk/shared/constants';

import { Box, Flex, Text } from '../../../customizables';
import type { ProtoConnectionStatus, ProtoProvider } from './prototypeState';
import { MONOCHROMATIC_PROVIDER_ICONS, PROVIDER_LABELS } from './prototypeState';

/*
 * A provider's mark at text size. Single-colour marks (Okta, SAML, OIDC)
 * are drawn as a mask so they take the surrounding text colour, which is
 * how the broken-connection row turns the whole cell orange.
 */
export const ProviderIcon = ({ provider, size = 16 }: { provider: ProtoProvider; size?: number }) => {
  const { iconId } = PROVIDER_LABELS[provider];
  const url = iconImageUrl(iconId);
  const isMonochromatic = MONOCHROMATIC_PROVIDER_ICONS.has(iconId);
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        ...(isMonochromatic
          ? {
              backgroundColor: 'currentColor',
              maskImage: `url(${url})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }
          : {
              backgroundImage: `url(${url})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }),
      }}
    />
  );
};

/** Provider mark plus name, coloured by the connection's health. */
export const ProviderMark = ({
  provider,
  name,
  status = 'active',
}: {
  provider: ProtoProvider;
  name: string;
  status?: ProtoConnectionStatus;
}) => (
  <Flex
    align='center'
    sx={t => ({
      gap: t.space.$1x5,
      color: status === 'broken' ? t.colors.$warning500 : t.colors.$colorForeground,
      minWidth: 0,
    })}
  >
    <ProviderIcon provider={provider} />
    <Text
      truncate
      sx={{ color: 'inherit' }}
    >
      {name}
    </Text>
  </Flex>
);
