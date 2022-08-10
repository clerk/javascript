import React from 'react';

import { descriptors, Flex } from '../customizables';
// import { useLoadingStatus } from '../hooks';
import { useLoadingStatus } from '../hooks';
import { handleError, sleep, useFormControl } from '../utils';
import { CardAlert } from './Alert';
import { Card } from './Card';
import { useCodeControl } from './CodeControl';
import { CodeForm } from './CodeForm';
import { useCardState } from './contexts';
import { Footer } from './Footer';
import { Header } from './Header';
import { IdentityPreview } from './IdentityPreview';

export type VerificationCodeCardProps = {
  cardTitle: string;
  cardSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  safeIdentifier?: string;
  profileImageUrl?: string;
  onCodeEntryFinishedAction: (
    code: string,
    resolve: () => Promise<void>,
    reject: (err: unknown) => Promise<void>,
  ) => void;
  onResendCodeClicked?: React.MouseEventHandler;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
  onIdentityPreviewEditClicked?: React.MouseEventHandler;
};

export const VerificationCodeCard = (props: VerificationCodeCardProps) => {
  const [success, setSuccess] = React.useState(false);
  const status = useLoadingStatus();
  const codeControlState = useFormControl('code', '');
  const codeControl = useCodeControl(codeControlState);
  const card = useCardState();

  const resolve = async () => {
    setSuccess(true);
    await sleep(750);
  };

  const reject = async (err: any) => {
    handleError(err, [codeControlState], card.setError);
    status.setIdle();
    await sleep(750);
    codeControl.reset();
  };

  codeControl.onCodeEntryFinished(code => {
    status.setLoading();
    codeControlState.setError(undefined);
    props.onCodeEntryFinishedAction(code, resolve, reject);
  });

  const handleResend = props.onResendCodeClicked
    ? (e: React.MouseEvent) => {
        codeControl.reset();
        props.onResendCodeClicked?.(e);
      }
    : undefined;

  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>
      <Header.Root>
        {/*<Header.BackLink onClick={goBack} />*/}
        <Header.Title>{props.cardTitle}</Header.Title>
        <Header.Subtitle>{props.cardSubtitle}</Header.Subtitle>
      </Header.Root>
      <IdentityPreview
        identifier={props.safeIdentifier}
        avatarUrl={props.profileImageUrl}
        onClick={props.onIdentityPreviewEditClicked}
      />
      {/*TODO: extract main in its own component */}
      <Flex
        direction='col'
        elementDescriptor={descriptors.main}
        gap={8}
      >
        <CodeForm
          title={props.formTitle}
          subtitle={props.formSubtitle}
          isLoading={status.isLoading}
          success={success}
          codeControl={codeControl}
          onResendCodeClicked={handleResend}
        />
      </Flex>
      <Footer.Root>
        <Footer.Action>
          {props.onShowAlternativeMethodsClicked && (
            <Footer.ActionLink onClick={props.onShowAlternativeMethodsClicked}>Use another method</Footer.ActionLink>
          )}
        </Footer.Action>
        <Footer.Links />
      </Footer.Root>
    </Card>
  );
};
