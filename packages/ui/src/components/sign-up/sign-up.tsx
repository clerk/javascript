import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { PROVIDERS } from '~/constants';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Field from '~/primitives/field';
import * as Icon from '~/primitives/icon';
import { Seperator } from '~/primitives/seperator';

export function SignUpComponent() {
  return (
    <SignUp.Root exampleMode>
      <SignUp.Step name='start'>
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
                    <Common.Connection
                      key={provider.id}
                      name={provider.id}
                    >
                      <Connection.Button>
                        <ConnectionIcon className='text-base' />
                        {provider.name}
                      </Connection.Button>
                    </Common.Connection>
                  );
                })}
              </Connection.Root>
              <Seperator>or</Seperator>
              <Common.Field
                name='emailAddress'
                asChild
              >
                <Field.Root>
                  <Common.Label asChild>
                    <Field.Label>Email address</Field.Label>
                  </Common.Label>
                  <Common.Input asChild>
                    <Field.Input />
                  </Common.Input>
                  <Common.FieldError>
                    {({ message }) => {
                      return <Field.Message intent='error'>{message}</Field.Message>;
                    }}
                  </Common.FieldError>
                </Field.Root>
              </Common.Field>

              <SignUp.Action
                submit
                asChild
              >
                <Button>Continue</Button>
              </SignUp.Action>
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
      </SignUp.Step>
    </SignUp.Root>
  );
}
