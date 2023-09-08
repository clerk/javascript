import { useId } from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Flex, FormLabel, Input, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

/**
 * @deprecated
 */
export const RadioGroup = (
  props: PropsOfComponent<typeof Input> & {
    radioOptions?: {
      value: string;
      label: string | LocalizationKey;
      description?: string | LocalizationKey;
    }[];
  },
) => {
  const { radioOptions, ...rest } = props;
  return (
    <Col
      elementDescriptor={descriptors.formFieldRadioGroup}
      gap={2}
    >
      {radioOptions?.map(r => (
        <RadioGroupItem
          key={r.value}
          {...r}
          inputProps={rest}
        />
      ))}
    </Col>
  );
};

/**
 * @deprecated
 */
const RadioGroupItem = (props: {
  inputProps: PropsOfComponent<typeof Input>;
  value: string;
  label: string | LocalizationKey;
  description?: string | LocalizationKey;
}) => {
  const id = useId();
  return (
    <Flex
      elementDescriptor={descriptors.formFieldRadioGroupItem}
      align='start'
    >
      <Input
        elementDescriptor={descriptors.formFieldRadioInput}
        {...props.inputProps}
        focusRing={false}
        id={id}
        sx={[
          t => ({
            width: 'fit-content',
            marginTop: t.space.$0x5,
          }),
          props.inputProps.sx,
        ]}
        type='radio'
        value={props.value}
        checked={props.value === props.inputProps.value}
      />

      <FormLabel
        elementDescriptor={descriptors.formFieldRadioLabel}
        htmlFor={id}
        sx={t => ({
          padding: `${t.space.$none} ${t.space.$2}`,
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <Text
          elementDescriptor={descriptors.formFieldRadioLabelTitle}
          variant='regularMedium'
          localizationKey={props.label}
        />

        {props.description && (
          <Text
            elementDescriptor={descriptors.formFieldRadioLabelDescription}
            colorScheme='neutral'
            variant='smallRegular'
            localizationKey={props.description}
          />
        )}
      </FormLabel>
    </Flex>
  );
};
