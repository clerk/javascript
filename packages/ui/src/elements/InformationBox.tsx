import type { LocalizationKey } from '../customizables';
import { Flex, Icon, Text } from '../customizables';
import { InformationCircle } from '../icons';

type InformationBoxProps = {
  message: LocalizationKey | string;
};

export function InformationBox(props: InformationBoxProps) {
  return (
    <Flex
      sx={t => ({
        gap: t.space.$2,
        padding: `${t.space.$3} ${t.space.$4}`,
        backgroundColor: t.colors.$neutralAlpha50,
        borderRadius: t.radii.$md,
      })}
    >
      <Icon
        icon={InformationCircle}
        sx={t => ({ opacity: t.opacity.$disabled })}
      />
      <Text
        localizationKey={props.message}
        sx={t => ({ color: t.colors.$colorMutedForeground })}
      />
    </Flex>
  );
}
