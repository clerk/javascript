import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, localizationKeys, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

type DividerProps = Omit<PropsOfComponent<typeof Flex>, 'elementDescriptor'> & {
  dividerText?: LocalizationKey;
};

export const Divider = (props: DividerProps) => {
  const { dividerText, ...rest } = props;
  return (
    <Flex
      center
      elementDescriptor={descriptors.dividerRow}
      {...rest}
    >
      <DividerLine />
      <Text
        localizationKey={!dividerText ? localizationKeys('dividerText') : dividerText}
        elementDescriptor={descriptors.dividerText}
        variant='body'
        colorScheme='secondary'
        sx={t => ({ margin: `0 ${t.space.$4}` })}
      />
      <DividerLine />
    </Flex>
  );
};

const DividerLine = () => {
  return (
    <Flex
      elementDescriptor={descriptors.dividerLine}
      sx={t => ({
        flex: '1',
        height: '1px',
        backgroundColor: t.colors.$neutralAlpha100,
      })}
    />
  );
};
