import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Text } from '../customizables';
import type { useFieldOTP } from './CodeControl';
import { CodeControl } from './CodeControl';
import { TimerButton } from './TimerButton';

type CodeFormProps = {
  title: LocalizationKey;
  subtitle: LocalizationKey;
  resendButton?: LocalizationKey;
  isLoading: boolean;
  isSuccess: boolean;
  onResendCode?: React.MouseEventHandler<HTMLButtonElement>;
  otpControl: ReturnType<typeof useFieldOTP>['otpControl'];
};

export const CodeForm = (props: CodeFormProps) => {
  const { subtitle, title, isLoading, isSuccess, otpControl, onResendCode, resendButton } = props;

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
        {...otpControl.otpInputProps}
        isLoading={isLoading}
        isSuccessfullyFilled={isSuccess}
      />
      {onResendCode && (
        <TimerButton
          elementDescriptor={descriptors.formResendCodeLink}
          onClick={onResendCode}
          startDisabled
          isDisabled={isSuccess || isLoading}
          showCounter={!isSuccess}
          sx={theme => ({ marginTop: theme.space.$6 })}
          localizationKey={resendButton}
        />
      )}
    </Col>
  );
};
