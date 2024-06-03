import * as React from 'react';

import { PROVIDERS } from '~/constants';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Field from '~/primitives/field';
import * as Icon from '~/primitives/icon';
import { Seperator } from '~/primitives/seperator';

type ConnectionName = (typeof PROVIDERS)[number]['name'];

export function SignUp() {
  const [busyConnectionName, setBusyConnectionName] = React.useState<ConnectionName | null>(null);
  const hasBusyConnection = busyConnectionName !== null;

  return (
    <Card.Root>
      <Card.Content>
        <Card.Header>
          <Card.Title>Create your account</Card.Title>
          <Card.Description>Welcome! Please fill in the details to get started.</Card.Description>
        </Card.Header>
        <Card.Body>
          <Connection.Root>
            {PROVIDERS.map(provider => {
              const ConnectionIcon = Icon[provider.icon];

              return (
                <Connection.Button
                  busy={busyConnectionName === provider.name}
                  disabled={hasBusyConnection && busyConnectionName !== provider.name}
                  icon={<ConnectionIcon className='text-base' />}
                  onClick={() => setBusyConnectionName(provider.name)}
                  key={provider.name}
                >
                  {provider.name}
                </Connection.Button>
              );
            })}
          </Connection.Root>
          <Seperator>or</Seperator>
          <Field.Root>
            <Field.Label>Email address</Field.Label>
            <Field.Input disabled={hasBusyConnection} />
            <Field.Message intent='error'>Identifier is invalid.</Field.Message>
          </Field.Root>
          <Button disabled={hasBusyConnection}>Continue</Button>
        </Card.Body>
      </Card.Content>
      <Card.Footer>
        <Card.FooterAction>
          <Card.FooterActionText>
            Have an account? <Card.FooterActionLink href='/sign-in'>Sign in</Card.FooterActionLink>
          </Card.FooterActionText>
        </Card.FooterAction>
      </Card.Footer>
    </Card.Root>
  );
}
