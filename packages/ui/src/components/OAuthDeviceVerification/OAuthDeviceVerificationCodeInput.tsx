import type { SlotProps } from 'input-otp';
import { OTPInput } from 'input-otp';

import { Box, descriptors, Flex, Text, useAppearance } from '@/ui/customizables';
import { OTPInputSlot } from '@/ui/elements/CodeControl';
import { useFormField } from '@/ui/primitives/hooks/useFormField';
import type { FormControlState } from '@/ui/utils/useFormControl';

import { normalizeOAuthDeviceUserCode } from './utils';

const USER_CODE_LENGTH = 8;
const USER_CODE_GROUP_LENGTH = 4;

type OAuthDeviceVerificationCodeInputProps = {
  control: FormControlState<'userCode'>;
};

function CodeGroup({ slots, hasError }: { slots: SlotProps[]; hasError: boolean }) {
  return (
    <Flex
      gap={2}
      hasError={hasError}
    >
      {slots.map((slot, index) => (
        <OTPInputSlot
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          elementDescriptor={descriptors.otpCodeFieldInput}
          hasError={hasError}
          {...slot}
        />
      ))}
    </Flex>
  );
}

export function OAuthDeviceVerificationCodeInput({ control }: OAuthDeviceVerificationCodeInputProps) {
  const { autoFocus } = useAppearance().parsedOptions;
  const formField = useFormField();
  const hasError = formField.hasError ?? false;

  return (
    <Box
      elementDescriptor={descriptors.otpCodeFieldInputContainer}
      sx={{ position: 'relative' }}
    >
      <OTPInput
        id={formField.id}
        name={control.name}
        autoFocus={autoFocus} // eslint-disable-line jsx-a11y/no-autofocus
        autoComplete='one-time-code'
        autoCapitalize='characters'
        aria-describedby={formField.feedbackMessageId || undefined}
        aria-invalid={hasError}
        aria-required={formField.isRequired}
        disabled={formField.isDisabled}
        inputMode='text'
        maxLength={USER_CODE_LENGTH}
        spellCheck={false}
        textAlign='center'
        value={control.value}
        pasteTransformer={normalizeOAuthDeviceUserCode}
        onBlur={control.onBlur}
        onFocus={control.onFocus}
        onChange={value => {
          control.clearFeedback();
          control.setValue(normalizeOAuthDeviceUserCode(value));
        }}
        render={({ slots }) => (
          <Flex
            align='center'
            elementDescriptor={descriptors.otpCodeFieldInputs}
            gap={3}
            hasError={hasError}
            justify='center'
            role='group'
          >
            <CodeGroup
              slots={slots.slice(0, USER_CODE_GROUP_LENGTH)}
              hasError={hasError}
            />
            <Text
              aria-hidden
              data-testid='device-code-separator'
              variant='h2'
            >
              -
            </Text>
            <CodeGroup
              slots={slots.slice(USER_CODE_GROUP_LENGTH)}
              hasError={hasError}
            />
          </Flex>
        )}
      />
    </Box>
  );
}
