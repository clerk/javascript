import type { PropsWithChildren } from 'react';
import React from 'react';

import { Button, Col, descriptors, localizationKeys } from '../customizables';
import type { LocalizationKey } from '../localization';
import { Card } from './Card';
import { useFieldOTP } from './CodeControl';
import { useCardState } from './contexts';
import { Footer } from './Footer';
import { Form } from './Form';
import { Header } from './Header';
import { IdentityPreview } from './IdentityPreview';

export type VerificationCodeCardProps = {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  //TODO-RETHEME remove
  formTitle?: LocalizationKey;
  //TODO-RETHEME remove
  formSubtitle?: LocalizationKey;
  inputLabel: LocalizationKey;
  safeIdentifier?: string | undefined | null;
  resendButton?: LocalizationKey;
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
        <Card.Alert>{card.error}</Card.Alert>
        <Header.Root>
          <Header.Title localizationKey={props.cardTitle} />
          <Header.Subtitle localizationKey={props.cardSubtitle} />
          <IdentityPreview
            identifier={props.safeIdentifier}
            avatarUrl={props.profileImageUrl}
            onClick={!props.onBackLinkClicked ? props.onIdentityPreviewEditClicked : undefined}
          />
        </Header.Root>
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
          <Button
            elementDescriptor={descriptors.formButtonPrimary}
            block
            hasArrow
            localizationKey={localizationKeys('formButtonPrimary')}
            onClick={otp.onFakeContinue}
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
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};
