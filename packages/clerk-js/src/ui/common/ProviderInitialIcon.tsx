import type { OAuthProvider, PhoneCodeProvider, Web3Provider } from '@clerk/shared/types';

import { Box, descriptors, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { common } from '../styledSystem';

type ProviderInitialIconProps = PropsOfComponent<typeof Box> & {
  value: string;
  id: Web3Provider | OAuthProvider | PhoneCodeProvider;
};

export const ProviderInitialIcon = (props: ProviderInitialIconProps) => {
  const { value, id, ...rest } = props;

  return (
    <Box
      as='span'
      elementDescriptor={[descriptors.providerIcon, descriptors.socialButtonsProviderInitialIcon]}
      elementId={descriptors.socialButtonsProviderInitialIcon.setId(id)}
      sx={t => ({
        ...common.centeredFlex('inline-flex'),
        width: t.space.$4,
        height: t.space.$4,
        borderRadius: t.radii.$sm,
        color: t.colors.$colorPrimaryForeground,
        backgroundColor: t.colors.$primary500,
      })}
      {...rest}
    >
      <Text
        as='span'
        variant='buttonSmall'
        sx={{
          ...common.centeredFlex('inline-flex'),
          width: '100%',
        }}
      >
        {value[0].toUpperCase()}
      </Text>
    </Box>
  );
};
