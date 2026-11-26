import * as stylex from '@stylexjs/stylex';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Prompt } from '../../../blocks/prompt';
import { Card } from '../../../components/card';
import { CopyButton } from '../../../components/copy-button';
import { Field } from '../../../components/field';
import { InputGroup } from '../../../components/input-group';
import { Reveal } from '../../../components/reveal';
import { useMessages } from '../../../localization';
import { styles } from './user-profile-authenticator-setup.styles';

export interface UserProfileAuthenticatorSetupViewProps {
  secret: string;
  uri: string;
}

export function UserProfileAuthenticatorSetupView({ secret, uri }: UserProfileAuthenticatorSetupViewProps) {
  const m = useMessages('userProfile').mfa.authenticatorSetup;
  const [showSetupKey, setShowSetupKey] = useState(false);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>{showSetupKey ? m.manualDescription : m.scanDescription}</Card.Description>
      </Card.Header>
      <Card.Content xstyle={styles.content}>
        <div {...stylex.props(styles.setup)}>
          <div {...stylex.props(styles.panels)}>
            <Reveal open={showSetupKey}>
              <div {...stylex.props(styles.setupKey)}>
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
              </div>
            </Reveal>
            <Reveal open={!showSetupKey}>
              <div {...stylex.props(styles.qrCode)}>
                <span {...stylex.props(styles.qrTile)}>
                  <QRCodeSVG
                    value={uri}
                    size={128}
                    marginSize={0}
                    role='img'
                    aria-label={m.qrCodeLabel}
                  />
                </span>
              </div>
            </Reveal>
          </div>
          <Prompt
            text={showSetupKey ? m.keyPrompt : m.scanPrompt}
            action={showSetupKey ? m.scanQrCode : m.viewSetupKey}
            onAction={() => setShowSetupKey(current => !current)}
          />
        </div>
      </Card.Content>
    </>
  );
}
