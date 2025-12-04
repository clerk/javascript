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

export const VerticalDivider = (props: DividerProps) => {
  const { sx, ...rest } = props;
  return (
    <Flex
      center
      direction='col'
      elementDescriptor={descriptors.dividerColumn}
      sx={[
        t => ({
          height: t.space.$6,
        }),
        sx,
      ]}
      {...rest}
    >
      <DividerLine vertical />
    </Flex>
  );
};

type DividerLineProps = {
  vertical?: boolean;
};

const DividerLine = (props?: DividerLineProps) => {
  const styles = props?.vertical ? { width: '1px' } : { height: '1px' };
  return (
    <Flex
      elementDescriptor={descriptors.dividerLine}
      sx={t => ({
        flex: '1',
        backgroundColor: t.colors.$borderAlpha100,
        ...styles,
      })}
    />
  );
};
