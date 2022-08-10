import React from 'react';

import { Col, descriptors, Text } from '../customizables';
import { CodeControl, useCodeControl } from './CodeControl';
import { TimerButton } from './TimerButton';

type CodeFormProps = {
  title: string;
  subtitle: string;
  isLoading: boolean;
  success: boolean;
  onResendCodeClicked?: React.MouseEventHandler<HTMLButtonElement>;
  codeControl: ReturnType<typeof useCodeControl>;
};

export const CodeForm = (props: CodeFormProps) => {
  const { subtitle, title, isLoading, success, codeControl, onResendCodeClicked } = props;

  return (
    <Col
      elementDescriptor={descriptors.form}
      gap={2}
    >
      <Col
        elementDescriptor={descriptors.formHeader}
        gap={1}
      >
        <Text
          elementDescriptor={descriptors.formHeaderTitle}
          variant='smallMedium'
        >
          {title}
        </Text>
        <Text
          elementDescriptor={descriptors.formHeaderSubtitle}
          variant='smallRegular'
          colorScheme='neutral'
        >
          {subtitle}
        </Text>
      </Col>
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
        >
          Resend code
        </TimerButton>
      )}
    </Col>
  );
};
