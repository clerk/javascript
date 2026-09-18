import * as stylex from '@stylexjs/stylex';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useMessages } from '../../localization';
import { styles } from './user-profile-authenticator-setup.styles';

export interface UserProfileAuthenticatorCopyProps {
  onCopy: (value: string) => void;
  state?: { status: 'pending' | 'success' } | { status: 'error'; message: string };
}

export interface UserProfileAuthenticatorSetupViewProps {
  secret: string;
  uri: string;
  secretCopy?: UserProfileAuthenticatorCopyProps;
  uriCopy?: UserProfileAuthenticatorCopyProps;
}

export function UserProfileAuthenticatorSetupView({
  secret,
  uri,
  secretCopy,
  uriCopy,
}: UserProfileAuthenticatorSetupViewProps) {
  const m = useMessages('userProfileAuthenticatorSetup');
  const [showSetupKey, setShowSetupKey] = useState(false);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>{showSetupKey ? m.manualDescription : m.scanDescription}</Card.Description>
      </Card.Header>
      <Card.Content>
        {showSetupKey ? (
          <>
            {[
              { label: m.setupKey, value: secret, copyLabel: m.copyKey, copy: secretCopy },
              { label: m.setupUri, value: uri, copyLabel: m.copyUri, copy: uriCopy },
            ].map(({ label, value, copyLabel, copy }) => {
              const feedback = copy?.state;
              return (
                <Field.Root key={label}>
                  <Field.Label>{label}</Field.Label>
                  <InputGroup.Root>
                    <InputGroup.Input
                      value={value}
                      readOnly
                    />
                    {copy ? (
                      <InputGroup.End>
                        <Button
                          type='button'
                          aria-label={copyLabel}
                          disabled={feedback?.status === 'pending'}
                          focusableWhenDisabled
                          onClick={() => copy.onCopy(value)}
                        >
                          <Icon name={feedback?.status === 'success' ? 'checkmark' : 'clipboard'} />
                        </Button>
                      </InputGroup.End>
                    ) : null}
                  </InputGroup.Root>
                  <Field.Message>
                    <Field.Error>{feedback?.status === 'error' ? feedback.message : null}</Field.Error>
                  </Field.Message>
                  <VisuallyHidden
                    role='status'
                    aria-label={copyLabel}
                  >
                    {feedback?.status === 'pending' ? m.copying : feedback?.status === 'success' ? m.copied : null}
                  </VisuallyHidden>
                </Field.Root>
              );
            })}
          </>
        ) : (
          <div {...stylex.props(styles.qrCode)}>
            <QRCodeSVG
              value={uri}
              size={160}
              marginSize={4}
              role='img'
              aria-label={m.qrCodeLabel}
            />
          </div>
        )}
        <Button
          type='button'
          variant='link'
          color='neutral'
          onClick={() => setShowSetupKey(current => !current)}
        >
          {showSetupKey ? m.scanQrCode : m.viewSetupKey}
        </Button>
      </Card.Content>
    </>
  );
}
