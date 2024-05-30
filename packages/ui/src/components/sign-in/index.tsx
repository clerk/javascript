import * as ElCommon from '@clerk/elements/common';
import * as ElSignIn from '@clerk/elements/sign-in';

import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Field from '~/primitives/field';
import { Seperator } from '~/primitives/seperator';

export function SignIn() {
  return (
    <ElSignIn.Root exampleMode>
      <ElSignIn.Step name='start'>
        <Card.Root>
          <Card.Content>
            <Card.Header>
              <Card.Title>Sign in to Clover Corp</Card.Title>
              <Card.Description>Welcome back! Please sign in to continue</Card.Description>
            </Card.Header>
            <Card.Body>
              <Connection.Root>
                <ElCommon.Connection
                  name='google'
                  asChild
                >
                  <Connection.Button>Google</Connection.Button>
                </ElCommon.Connection>
                <ElCommon.Connection
                  name='github'
                  asChild
                >
                  <Connection.Button>GitHub</Connection.Button>
                </ElCommon.Connection>
              </Connection.Root>
              <Seperator>or</Seperator>
              <ElCommon.Field
                name='emailAddress'
                asChild
              >
                <Field.Root>
                  <ElCommon.Label asChild>
                    <Field.Label>Email address</Field.Label>
                  </ElCommon.Label>
                  <ElCommon.Input asChild>
                    <Field.Input />
                  </ElCommon.Input>
                  <ElCommon.FieldError>
                    {({ message }) => {
                      return <Field.Message intent='error'>{message}</Field.Message>;
                    }}
                  </ElCommon.FieldError>
                </Field.Root>
              </ElCommon.Field>
              <Button>Continue</Button>
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
      </ElSignIn.Step>
    </ElSignIn.Root>
  );
}
