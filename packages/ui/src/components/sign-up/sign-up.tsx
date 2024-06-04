import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

import { getEnabledSocialConnectionsFromEnvironment } from '~/hooks/getEnabledSocialConnectionsFromEnvironment';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Connection from '~/primitives/connection';
import * as Field from '~/primitives/field';
import * as Icon from '~/primitives/icon';
import { Seperator } from '~/primitives/seperator';

export function SignUpComponent() {
  const clerk = useClerk();
  // @ts-ignore clerk is not null
  const enabledConnections = getEnabledSocialConnectionsFromEnvironment(clerk?.__unstable__environment);

  return (
    <SignUp.Root exampleMode>
      <Common.Loading>
        {isGlobalLoading => {
          return (
            <SignUp.Step
              data-clerk
              name='start'
            >
              <Card.Root>
                <Card.Content>
                  <Card.Header>
                    <Card.Title>Create your account</Card.Title>
                    <Card.Description>Welcome! Please fill in the details to get started.</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Connection.Root>
                      {enabledConnections.map(connection => {
                        // @ts-ignore TODO: properly fix type
                        const ConnectionIcon = Icon[PROVIDER_ICON_MAP[connection.provider]];
                        return (
                          <Common.Connection
                            key={connection.provider}
                            name={connection.provider}
                            asChild
                          >
                            <Common.Loading scope={`provider:${connection.provider}`}>
                              {isConnectionLoading => {
                                return (
                                  <Connection.Button
                                    busy={isConnectionLoading}
                                    disabled={isGlobalLoading || isConnectionLoading}
                                    icon={<ConnectionIcon className='text-base' />}
                                  >
                                    {connection.name}
                                  </Connection.Button>
                                );
                              }}
                            </Common.Loading>
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
                          <Field.Input disabled={isGlobalLoading} />
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
                      <Common.Loading>
                        {isSubmitting => {
                          return (
                            <Button
                              icon={<Icon.CaretRight />}
                              busy={isSubmitting}
                              disabled={isGlobalLoading}
                            >
                              Continue
                            </Button>
                          );
                        }}
                      </Common.Loading>
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
          );
        }}
      </Common.Loading>
    </SignUp.Root>
  );
}
