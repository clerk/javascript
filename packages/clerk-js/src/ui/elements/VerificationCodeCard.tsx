import type { PropsWithChildren } from 'react';
import React from 'react';

import { Button, Col, descriptors, localizationKeys } from '../customizables';
import type { LocalizationKey } from '../localization';
import { Card } from './Card';
import { useFieldOTP } from './CodeControl';
import { useCardState } from './contexts';
import { Form } from './Form';
import { Header } from './Header';
import { IdentityPreview } from './IdentityPreview';

export type VerificationCodeCardProps = {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel?: LocalizationKey;
  safeIdentifier?: string | undefined | null;
  resendButton?: LocalizationKey;
  alternativeMethodsLabel?: LocalizationKey;
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
  const card = useCardState();

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      props.onCodeEntryFinishedAction(code, resolve, reject);
    },
    onResendCodeClicked: props.onResendCodeClicked,
  });

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root>
          <Header.Title localizationKey={props.cardTitle} />
          <Header.Subtitle localizationKey={props.cardSubtitle} />
          <IdentityPreview
            identifier={props.safeIdentifier}
            avatarUrl={props.profileImageUrl}
            onClick={!props.onBackLinkClicked ? props.onIdentityPreviewEditClicked : undefined}
          />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        {children}
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.OTPInput
            {...otp}
            label={props.inputLabel}
            resendButton={props.resendButton}
          />
          <Col gap={3}>
            <Button
              elementDescriptor={descriptors.formButtonPrimary}
              block
              hasArrow
              isLoading={otp.isLoading}
              localizationKey={localizationKeys('formButtonPrimary')}
              onClick={otp.onFakeContinue}
            />
            {showAlternativeMethods && props.onShowAlternativeMethodsClicked && (
              <Card.Action elementId='alternativeMethods'>
                <Card.ActionLink
                  localizationKey={
                    props.alternativeMethodsLabel ?? localizationKeys('footerActionLink__useAnotherMethod')
                  }
                  onClick={props.onShowAlternativeMethodsClicked}
                />
              </Card.Action>
            )}
          </Col>
        </Col>
      </Card.Content>

      <Card.Footer />
    </Card.Root>
  );
};
