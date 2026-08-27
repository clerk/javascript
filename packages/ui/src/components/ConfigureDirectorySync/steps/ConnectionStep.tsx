import { Badge, Col, Flex, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

export const ConnectionStep = (): JSX.Element => {
  const { goNext } = useWizard();
  const { connection, provider, providerMeta, directory, createDirectory } = useConfigureDirectorySync();
  const card = useCardState();

  const hasSsoConnection = Boolean(connection);
  const isGoogle = provider === 'google';
  const domains = connection?.domains ?? [];

  const handleContinue = async (): Promise<void> => {
    if (!connection || isGoogle || card.isLoading) {
      return;
    }

    if (directory) {
      goNext();
      return;
    }

    card.setError(undefined);
    card.setLoading();
    try {
      await createDirectory();
      goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Header
        title='Linked SSO connection'
        description='Directory Sync provisions organization members through your existing SSO connection.'
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          {hasSsoConnection && connection ? (
            <>
              <Text
                as='p'
                colorScheme='secondary'
              >
                Your identity provider and verified domains are inherited from the SSO connection — you won&apos;t be
                asked for them again.
              </Text>

              <Col
                sx={t => ({
                  gap: t.space.$3,
                  padding: t.space.$4,
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$solid,
                  borderColor: t.colors.$borderAlpha150,
                })}
              >
                <Flex
                  align='center'
                  justify='between'
                >
                  <Text
                    as='span'
                    sx={t => ({ fontWeight: t.fontWeights.$medium })}
                  >
                    {providerMeta?.name ?? connection.name}
                  </Text>
                  <Badge colorScheme={connection.active ? 'success' : 'danger'}>
                    {connection.active ? 'Active' : 'Inactive'}
                  </Badge>
                </Flex>

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
            </>
          ) : (
            <Alert
              variant='warning'
              title='Single Sign-On is not configured yet'
              subtitle='Directory Sync requires an SSO connection. Configure and verify your SSO connection first, then return here to set up provisioning.'
            />
          )}

          {card.error && (
            <Alert
              variant='danger'
              title={card.error}
            />
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Continue
          onClick={() => void handleContinue()}
          isLoading={card.isLoading}
          isDisabled={!hasSsoConnection || isGoogle}
        />
      </Step.Footer>
    </>
  );
};
