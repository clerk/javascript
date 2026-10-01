import * as stylex from '@stylexjs/stylex';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { CopyButton } from '../../components/copy-button';
import { Field } from '../../components/field';
import { InputGroup } from '../../components/input-group';
import { useMessages } from '../../localization';
import { styles } from './user-profile-authenticator-setup.styles';

export interface UserProfileAuthenticatorSetupViewProps {
  secret: string;
  uri: string;
}

export function UserProfileAuthenticatorSetupView({ secret, uri }: UserProfileAuthenticatorSetupViewProps) {
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
              { label: m.setupKey, value: secret, copyLabel: m.copyKey },
              { label: m.setupUri, value: uri, copyLabel: m.copyUri },
            ].map(({ label, value, copyLabel }) => (
              <Field.Root key={label}>
                <Field.Label>{label}</Field.Label>
                <InputGroup.Root>
                  <InputGroup.Input
                    value={value}
                    readOnly
                  />
                  <InputGroup.End>
                    <CopyButton
                      value={value}
                      label={copyLabel}
                      copiedLabel={m.copied}
                    />
                  </InputGroup.End>
                </InputGroup.Root>
              </Field.Root>
            ))}
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
