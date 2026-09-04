import { useEffect, useRef, useState } from 'react';

import { Badge, Button, Col, descriptors, Flex, Icon, Input, Spinner, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Collapsible } from '@/elements/Collapsible';
import { useCardState } from '@/elements/contexts';
import { Checkmark, ChevronDown, Clipboard, ExclamationTriangle } from '@/icons';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

const FieldLabel = ({ children }: { children: string }): JSX.Element => (
  <Text
    as='span'
    sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
  >
    {children}
  </Text>
);

export const ConfigureStep = (): JSX.Element => {
  const { goNext } = useWizard();
  const { connection, provider, providerMeta, directory, createDirectory, revealedToken, rotateToken } =
    useConfigureDirectorySync();
  const card = useCardState();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const isGoogle = provider === 'google';
  const canProvision = Boolean(connection) && !isGoogle;
  const domains = connection?.domains ?? [];
  const instructions = providerMeta?.instructions ?? [];

  const run = async (action: () => Promise<unknown>): Promise<void> => {
    if (card.isLoading) {
      return;
    }
    card.setError(undefined);
    card.setLoading();
    try {
      await action();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  // The credentials only exist once the directory does, so create it on entry.
  const hasAttemptedCreate = useRef(false);
  useEffect(() => {
    if (!canProvision || directory !== null || hasAttemptedCreate.current) {
      return;
    }
    hasAttemptedCreate.current = true;
    void run(createDirectory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canProvision, directory]);

  return (
    <>
      <Step.Header
        title='Configure'
        description='Add these credentials to your identity provider to configure Directory Sync'
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          {!connection ? (
            <Alert
              variant='warning'
              title='Single Sign-On is not configured yet'
              subtitle='Directory Sync requires an SSO connection. Configure and verify your SSO connection first, then return here to set up provisioning.'
            />
          ) : (
            <>
              <Col
                sx={t => ({
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$solid,
                  borderColor: t.colors.$borderAlpha150,
                  overflow: 'hidden',
                })}
              >
                <Col sx={t => ({ gap: t.space.$2, padding: t.space.$4 })}>
                  <Text
                    as='span'
                    sx={t => ({ fontWeight: t.fontWeights.$medium })}
                  >
                    {providerMeta?.name ?? connection.name}
                  </Text>

                  {domains.length > 0 && (
                    <Flex
                      align='center'
                      wrap='wrap'
                      sx={t => ({ gap: t.space.$1x5 })}
                    >
                      <Text
                        as='span'
                        colorScheme='secondary'
                        sx={t => ({ fontSize: t.fontSizes.$sm })}
                      >
                        Domains:
                      </Text>
                      {domains.map(domain => (
                        <Badge key={domain}>{domain}</Badge>
                      ))}
                    </Flex>
                  )}
                </Col>

                {instructions.length > 0 && (
                  <Col
                    sx={t => ({
                      backgroundColor: t.colors.$neutralAlpha25,
                      borderTopWidth: t.borderWidths.$normal,
                      borderTopStyle: t.borderStyles.$solid,
                      borderTopColor: t.colors.$borderAlpha100,
                    })}
                  >
                    <Button
                      variant='ghost'
                      colorScheme='secondary'
                      size='sm'
                      aria-expanded={isInstructionsOpen}
                      onClick={() => setIsInstructionsOpen(open => !open)}
                      sx={t => ({
                        justifyContent: 'start',
                        gap: t.space.$1x5,
                        padding: `${t.space.$3} ${t.space.$4}`,
                        borderRadius: 0,
                        color: t.colors.$colorForeground,
                        '&:hover': { color: t.colors.$colorForeground },
                      })}
                    >
                      <Text
                        as='span'
                        sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
                      >
                        View instructions
                      </Text>
                      <Icon
                        icon={ChevronDown}
                        size='sm'
                        sx={t => ({
                          transform: isInstructionsOpen ? 'rotate(180deg)' : 'none',
                          transition: `transform ${t.transitionDuration.$fast}`,
                        })}
                      />
                    </Button>

                    <Collapsible open={isInstructionsOpen}>
                      <Col
                        as='ol'
                        sx={t => ({
                          gap: t.space.$1x5,
                          padding: `0 ${t.space.$4} ${t.space.$4}`,
                          paddingInlineStart: t.space.$8,
                          listStyle: 'decimal',
                        })}
                      >
                        {instructions.map(instruction => (
                          <Text
                            key={instruction}
                            as='li'
                            colorScheme='secondary'
                            sx={t => ({ fontSize: t.fontSizes.$sm })}
                          >
                            {instruction}
                          </Text>
                        ))}
                      </Col>
                    </Collapsible>
                  </Col>
                )}
              </Col>

              {isGoogle && (
                <Alert
                  variant='warning'
                  title='Google Workspace connections are not supported here'
                  subtitle='Google Workspace provisions through a credential-based integration instead of SCIM push. Set up Directory Sync for this connection from the Clerk Dashboard.'
                />
              )}

              {!connection.active && !isGoogle && (
                <Alert
                  variant='warning'
                  title='Your SSO connection is configured but not active. Members can be provisioned now, but they can only sign in once SSO is activated.'
                />
              )}

              {directory ? (
                <>
                  <Col sx={t => ({ gap: t.space.$1x5 })}>
                    <FieldLabel>SCIM endpoint URL</FieldLabel>
                    <ClipboardInput
                      value={directory.endpointUrl}
                      readOnly
                      copyIcon={Clipboard}
                      copiedIcon={Checkmark}
                    />
                  </Col>

                  <Col sx={t => ({ gap: t.space.$1x5 })}>
                    <FieldLabel>Bearer token</FieldLabel>
                    <Flex
                      align='center'
                      sx={t => ({ gap: t.space.$2 })}
                    >
                      {revealedToken ? (
                        <ClipboardInput
                          value={revealedToken}
                          readOnly
                          copyIcon={Clipboard}
                          copiedIcon={Checkmark}
                          sx={{ flex: 1 }}
                        />
                      ) : (
                        <Input
                          value=''
                          readOnly
                          placeholder='Generate a new token to reveal it'
                          sx={{ flex: 1 }}
                        />
                      )}
                      <Button
                        variant='outline'
                        size='sm'
                        isLoading={card.isLoading}
                        onClick={() => void run(rotateToken)}
                        sx={{ flexShrink: 0 }}
                      >
                        Generate new token
                      </Button>
                    </Flex>
                    <Flex
                      align='center'
                      sx={t => ({ gap: t.space.$1x5 })}
                    >
                      <Icon
                        icon={ExclamationTriangle}
                        size='sm'
                        colorScheme='neutral'
                      />
                      <Text
                        as='span'
                        colorScheme='secondary'
                        sx={t => ({ fontSize: t.fontSizes.$sm })}
                      >
                        This token is only shown once. Generate a new token if you lose it.
                      </Text>
                    </Flex>
                  </Col>
                </>
              ) : (
                canProvision &&
                !card.error && (
                  <Flex
                    align='center'
                    justify='center'
                    sx={t => ({ paddingBlock: t.space.$5 })}
                  >
                    <Spinner
                      size='xs'
                      colorScheme='neutral'
                      elementDescriptor={descriptors.spinner}
                    />
                  </Flex>
                )
              )}
            </>
          )}

          {card.error && (
            <Alert
              variant='danger'
              title={card.error}
            />
          )}

          {!directory && canProvision && card.error && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => void run(createDirectory)}
              sx={{ alignSelf: 'start' }}
            >
              Try again
            </Button>
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={!directory}
        />
      </Step.Footer>
    </>
  );
};
