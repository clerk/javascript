import * as stylex from '@stylexjs/stylex';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Banner } from '../../components/banner';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Text } from '../../components/text';
import { userProfileAuthenticatorSetupMessages as m } from './user-profile-authenticator-setup.messages';
import { styles } from './user-profile-authenticator-setup.styles';

export interface UserProfileAuthenticatorSetupViewProps {
  secret: string;
  uri: string;
  onCopy?: (value: string) => void;
  copyStatus?: 'pending' | 'success';
  copyErrorMessage?: string;
}

export function UserProfileAuthenticatorSetupView({
  secret,
  uri,
  onCopy,
  copyStatus,
  copyErrorMessage,
}: UserProfileAuthenticatorSetupViewProps) {
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
                  {onCopy ? (
                    <InputGroup.End>
                      <Button
                        type='button'
                        aria-label={copyLabel}
                        disabled={copyStatus === 'pending'}
                        focusableWhenDisabled
                        onClick={() => onCopy(value)}
                      >
                        <Icon name='clipboard' />
                      </Button>
                    </InputGroup.End>
                  ) : null}
                </InputGroup.Root>
              </Field.Root>
            ))}
            {copyErrorMessage ? (
              <Banner.Root
                color='negative'
                role='alert'
              >
                <Banner.Label>{copyErrorMessage}</Banner.Label>
              </Banner.Root>
            ) : null}
            <Text
              role='status'
              aria-label={m.copyFeedback}
            >
              {copyStatus === 'pending' ? m.copying : copyStatus === 'success' ? m.copied : null}
            </Text>
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
