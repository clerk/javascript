import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Text } from '../customizables';
import type { useCodeControl } from './CodeControl';
import { CodeControl } from './CodeControl';
import { TimerButton } from './TimerButton';

type CodeFormProps = {
  title: LocalizationKey;
  subtitle: LocalizationKey;
  resendButton?: LocalizationKey;
  isLoading: boolean;
  success: boolean;
  onResendCodeClicked?: React.MouseEventHandler<HTMLButtonElement>;
  codeControl: ReturnType<typeof useCodeControl>;
};

export const CodeForm = (props: CodeFormProps) => {
  const { subtitle, title, isLoading, success, codeControl, onResendCodeClicked, resendButton } = props;

  return (
    <Col
      elementDescriptor={descriptors.form}
      gap={2}
    >
      <Text
        localizationKey={title}
        elementDescriptor={descriptors.formHeaderTitle}
        variant='smallMedium'
      />
      <Text
        localizationKey={subtitle}
        elementDescriptor={descriptors.formHeaderSubtitle}
        variant='smallRegular'
        colorScheme='neutral'
      />
      <CodeControl
        {...codeControl.otpInputProps}
        isLoading={isLoading}
        isSuccessfullyFilled={success}
      />
      {onResendCodeClicked && (
        <TimerButton
          elementDescriptor={descriptors.formResendCodeLink}
          onClick={onResendCodeClicked}
          startDisabled
          isDisabled={success || isLoading}
          showCounter={!success}
          sx={theme => ({ marginTop: theme.space.$6 })}
          localizationKey={resendButton}
        />
      )}
    </Col>
  );
};
