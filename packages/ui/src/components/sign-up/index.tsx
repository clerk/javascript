import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Field from '~/primitives/field';
import { Seperator } from '~/primitives/seperator';

export function SignUp() {
  return (
    <Card.Root>
      <Card.Content>
        <Card.Header>
          <Card.Title>Create your account</Card.Title>
          <Card.Description>Welcome! Please fill in the details to get started.</Card.Description>
        </Card.Header>
        <Card.Body>
          <Connection.Root>
            <Connection.Button>Google</Connection.Button>
            <Connection.Button>GitHub</Connection.Button>
          </Connection.Root>
          <Seperator>or</Seperator>
          <Field.Root>
            <Field.Label>Email address</Field.Label>
            <Field.Input />
            <Field.Message intent='error'>Identifier is invalid.</Field.Message>
          </Field.Root>
          <Button>Continue</Button>
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
