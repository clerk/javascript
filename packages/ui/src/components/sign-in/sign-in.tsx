import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import * as React from 'react';

import { PROVIDERS } from '~/constants';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Field from '~/primitives/field-elements';
import * as Icon from '~/primitives/icon';
import { Seperator } from '~/primitives/seperator';

type ConnectionName = (typeof PROVIDERS)[number]['name'];

export function SignInComponent() {
  const [busyConnectionName, setBusyConnectionName] = React.useState<ConnectionName | null>(null);
  const [isContinuing, setIsContinuing] = React.useState(false);

  const hasBusyConnection = busyConnectionName !== null;

  return (
    <SignIn.Root exampleMode>
      <SignIn.Step name='start'>
        <Card.Root>
          <Card.Content>
            <Card.Header>
              <Card.Title>Sign in to Acme Corp</Card.Title>
              <Card.Description>Welcome back! Please sign in to continue</Card.Description>
            </Card.Header>
            <Card.Body>
              <Connection.Root>
                {PROVIDERS.map(provider => {
                  const ConnectionIcon = Icon[provider.icon];
                  return (
                    <Common.Connection
                      key={provider.id}
                      name={provider.id}
                      asChild
                    >
                      <Connection.Button
                        busy={busyConnectionName === provider.name}
                        disabled={isContinuing || (hasBusyConnection && busyConnectionName !== provider.name)}
                        icon={<ConnectionIcon className='text-base' />}
                        onClick={() => setBusyConnectionName(provider.name)}
                        key={provider.name}
                      >
                        {provider.name}
                      </Connection.Button>
                    </Common.Connection>
                  );
                })}
              </Connection.Root>
              <Seperator>or</Seperator>

              <Field.Root name='emailAddress'>
                <Field.Label>Email address</Field.Label>
                <Field.Input disabled={isContinuing || hasBusyConnection} />
                <Field.Message />
              </Field.Root>

              <Field.Root name='password'>
                <Field.Label>Password</Field.Label>
                <Field.Input
                  disabled={isContinuing || hasBusyConnection}
                  validatePassword
                />
                <Field.Message />
              </Field.Root>

              <SignIn.Action
                submit
                asChild
              >
                <Button
                  icon={<Icon.CaretRight />}
                  busy={isContinuing}
                  disabled={hasBusyConnection}
                  onClick={() => setIsContinuing(true)}
                >
                  Continue
                </Button>
              </SignIn.Action>
            </Card.Body>
          </Card.Content>
          <Card.Footer>
            <Card.FooterAction>
              <Card.FooterActionText>
                Don&apos;t have an account? <Card.FooterActionLink href='/sign-up'>Sign up</Card.FooterActionLink>
              </Card.FooterActionText>
            </Card.FooterAction>
          </Card.Footer>
        </Card.Root>
      </SignIn.Step>
    </SignIn.Root>
  );
}
