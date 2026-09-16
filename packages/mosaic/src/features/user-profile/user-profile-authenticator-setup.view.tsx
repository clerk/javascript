import * as stylex from '@stylexjs/stylex';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { userProfileAuthenticatorSetupMessages as m } from './user-profile-authenticator-setup.messages';
import { styles } from './user-profile-authenticator-setup.styles';

export interface UserProfileAuthenticatorSetupViewProps {
  secret: string;
  uri: string;
}

export function UserProfileAuthenticatorSetupView({ secret, uri }: UserProfileAuthenticatorSetupViewProps) {
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
            <Field.Root>
              <Field.Label>{m.setupKey}</Field.Label>
              <Input
                value={secret}
                readOnly
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{m.setupUri}</Field.Label>
              <Input
                value={uri}
                readOnly
              />
            </Field.Root>
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
