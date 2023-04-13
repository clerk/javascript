import type { PropsWithChildren } from 'react';
import React from 'react';

import { Col, descriptors, localizationKeys } from '../customizables';
import { useLoadingStatus } from '../hooks';
import type { LocalizationKey } from '../localization';
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
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  formTitle: LocalizationKey;
  formSubtitle: LocalizationKey;
  resendButton?: LocalizationKey;
  safeIdentifier?: string;
  profileImageUrl?: string;
  onCodeEntryFinishedAction: (
    code: string,
    resolve: () => Promise<void>,
    reject: (err: unknown) => Promise<void>,
  ) => void;
  onResendCodeClicked?: React.MouseEventHandler;
  showAlternativeMethods?: boolean;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
  onIdentityPreviewEditClicked?: React.MouseEventHandler;
  onBackLinkClicked?: React.MouseEventHandler;
};

export const VerificationCodeCard = (props: PropsWithChildren<VerificationCodeCardProps>) => {
  const { showAlternativeMethods = true, children } = props;
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
        {props.onBackLinkClicked && <Header.BackLink onClick={props.onBackLinkClicked} />}
        <Header.Title localizationKey={props.cardTitle} />
        <Header.Subtitle localizationKey={props.cardSubtitle} />
      </Header.Root>
      {children}
      <IdentityPreview
        identifier={props.safeIdentifier}
        avatarUrl={props.profileImageUrl}
        onClick={!props.onBackLinkClicked ? props.onIdentityPreviewEditClicked : undefined}
      />
      <Col
        elementDescriptor={descriptors.main}
        gap={8}
      >
        <CodeForm
          title={props.formTitle}
          subtitle={props.formSubtitle}
          resendButton={props.resendButton}
          isLoading={status.isLoading}
          success={success}
          codeControl={codeControl}
          onResendCodeClicked={handleResend}
        />
      </Col>

      {showAlternativeMethods && props.onShowAlternativeMethodsClicked && (
        <Footer.Root>
          <Footer.Action elementId='alternativeMethods'>
            <Footer.ActionLink
              localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
              onClick={props.onShowAlternativeMethodsClicked}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      )}
    </Card>
  );
};
