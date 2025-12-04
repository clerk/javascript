import { descriptors, Flex, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { getFlagEmojiFromCountryIso, parsePhoneString, stringToFormattedPhoneString } from '../utils/phoneUtils';

type FormattedPhoneProps = {
  value: string;
};

export const FormattedPhoneNumber = (props: FormattedPhoneProps) => {
  const formattedPhone = stringToFormattedPhoneString(props.value);
  const flag = getFlagEmojiFromCountryIso(parsePhoneString(props.value).iso);

  return (
    <Flex
      elementDescriptor={descriptors.formattedPhoneNumber}
      gap={4}
    >
      <Text
        elementDescriptor={descriptors.formattedPhoneNumberFlag}
        sx={theme => ({ fontSize: theme.fontSizes.$sm })}
      >
        {flag}
      </Text>
      <Text elementDescriptor={descriptors.formattedPhoneNumberText}>{formattedPhone}</Text>
    </Flex>
  );
};

export const FormattedPhoneNumberText = (props: FormattedPhoneProps & PropsOfComponent<typeof Text>) => {
  const formattedPhone = stringToFormattedPhoneString(props.value);

  return (
    <Text
      as='span'
      elementDescriptor={descriptors.formattedPhoneNumberText}
    >
      {formattedPhone}
    </Text>
  );
};
