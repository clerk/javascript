import * as Common from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Field from '~/primitives/field';
import { Seperator } from '~/primitives/seperator';

export function SignInComponent() {
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
                <Common.Connection
                  name='google'
                  asChild
                >
                  <Connection.Button>
                    <Common.Icon className='size-4' />
                    Google
                  </Connection.Button>
                </Common.Connection>
                <Common.Connection
                  name='github'
                  asChild
                >
                  <Connection.Button>
                    <Common.Icon className='size-4' />
                    GitHub
                  </Connection.Button>
                </Common.Connection>
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

              <SignIn.Action
                submit
                asChild
              >
                <Button>Continue</Button>
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
