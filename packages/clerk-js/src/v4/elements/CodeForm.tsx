import React from 'react';

import { Col, Text } from '../customizables';
import { CodeControl, useCodeControl } from './CodeControl';
import { TimerButton } from './TimerButton';

type CodeFormProps = {
  title: string;
  subtitle: string;
  isLoading: boolean;
  success: boolean;
  onResendCodeClicked: React.MouseEventHandler<HTMLButtonElement>;
  codeControl: ReturnType<typeof useCodeControl>;
};

export const CodeForm = (props: CodeFormProps) => {
  const { subtitle, title, isLoading, success, codeControl, onResendCodeClicked } = props;

  return (
    <Col gap={2}>
      <Col gap={1}>
        <Text variant='smallMedium'>{title}</Text>
        <Text
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
      <TimerButton
        onClick={onResendCodeClicked}
        startDisabled
        isDisabled={success || isLoading}
        showCounter={!success}
        sx={theme => ({ marginTop: theme.space.$6 })}
      >
        Resend code
      </TimerButton>
    </Col>
  );
};
