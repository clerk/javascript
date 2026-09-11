import { useEffect, useRef, useState } from 'react';

import type { LocalizationKey } from '@/customizables';
import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Icon,
  Input,
  localizationKeys,
  Spinner,
  Text,
  useLocalizations,
} from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Collapsible } from '@/elements/Collapsible';
import { useCardState } from '@/elements/contexts';
import { Checkmark, ChevronDown, Clipboard, ExclamationTriangle } from '@/icons';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';
import { GoogleCredentialsForm } from '../GoogleCredentialsForm';

const FieldLabel = ({ id, localizationKey }: { id: string; localizationKey: LocalizationKey }): JSX.Element => (
  <Text
    elementDescriptor={descriptors.configureDirectorySyncFieldLabel}
    elementId={descriptors.configureDirectorySyncFieldLabel.setId(id)}
    as='span'
    localizationKey={localizationKey}
    sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
  />
);

export const ConfigureStep = (): JSX.Element => {
  const { goNext } = useWizard();
  const { connection, providerMeta, directory, createDirectory, revealedToken, rotateToken } =
    useConfigureDirectorySync();
  const { t } = useLocalizations();
  const card = useCardState();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // Pull providers hand Clerk a credential instead of receiving a token, so the
  // directory still has to exist first — it is what the credential attaches to.
  const isPull = providerMeta?.mode === 'pull';
  const canProvision = Boolean(connection);
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
        title={localizationKeys('configureDirectorySync.configureStep.title')}
        description={localizationKeys('configureDirectorySync.configureStep.subtitle')}
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          {!connection ? (
            <Alert
              variant='warning'
              title={localizationKeys('configureDirectorySync.configureStep.error__ssoRequired.title')}
              subtitle={localizationKeys('configureDirectorySync.configureStep.error__ssoRequired.subtitle')}
            />
          ) : (
            <>
              <Col
                elementDescriptor={descriptors.configureDirectorySyncConnectionCard}
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
                    elementDescriptor={descriptors.configureDirectorySyncConnectionCardName}
                    as='span'
                    localizationKey={providerMeta?.name}
                    sx={t => ({ fontWeight: t.fontWeights.$medium })}
                  >
                    {connection.name}
                  </Text>

                  {domains.length > 0 && (
                    <Flex
                      elementDescriptor={descriptors.configureDirectorySyncConnectionCardDomains}
                      align='center'
                      wrap='wrap'
                      sx={t => ({ gap: t.space.$1x5 })}
                    >
                      <Text
                        as='span'
                        colorScheme='secondary'
                        localizationKey={localizationKeys('configureDirectorySync.configureStep.domainsLabel')}
                        sx={t => ({ fontSize: t.fontSizes.$sm })}
                      />
                      {domains.map(domain => (
                        <Badge
                          key={domain}
                          elementDescriptor={descriptors.configureDirectorySyncConnectionCardDomainBadge}
                        >
                          {domain}
                        </Badge>
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
                      elementDescriptor={descriptors.configureDirectorySyncInstructionsToggle}
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
                        localizationKey={localizationKeys(
                          'configureDirectorySync.configureStep.instructions.actionLabel__toggle',
                        )}
                        sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
                      />
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
                        elementDescriptor={descriptors.configureDirectorySyncInstructionsList}
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
                            key={instruction.key}
                            elementDescriptor={descriptors.configureDirectorySyncInstructionsListItem}
                            as='li'
                            colorScheme='secondary'
                            localizationKey={instruction}
                            sx={t => ({ fontSize: t.fontSizes.$sm })}
                          />
                        ))}
                      </Col>
                    </Collapsible>
                  </Col>
                )}
              </Col>

              {!connection.active && (
                <Alert
                  variant='warning'
                  title={localizationKeys('configureDirectorySync.configureStep.warning__ssoInactive')}
                />
              )}

              {directory ? (
                isPull ? (
                  <GoogleCredentialsForm />
                ) : (
                  <>
                    <Col sx={t => ({ gap: t.space.$1x5 })}>
                      <FieldLabel
                        id='endpointUrl'
                        localizationKey={localizationKeys(
                          'configureDirectorySync.configureStep.formFieldLabel__endpointUrl',
                        )}
                      />
                      <ClipboardInput
                        elementDescriptor={descriptors.configureDirectorySyncEndpointUrlInput}
                        value={directory.endpointUrl}
                        readOnly
                        copyIcon={Clipboard}
                        copiedIcon={Checkmark}
                      />
                    </Col>

                    <Col sx={t => ({ gap: t.space.$1x5 })}>
                      <FieldLabel
                        id='token'
                        localizationKey={localizationKeys('configureDirectorySync.configureStep.formFieldLabel__token')}
                      />
                      <Flex
                        align='center'
                        sx={t => ({ gap: t.space.$2 })}
                      >
                        {revealedToken ? (
                          <ClipboardInput
                            elementDescriptor={descriptors.configureDirectorySyncTokenInput}
                            value={revealedToken}
                            readOnly
                            copyIcon={Clipboard}
                            copiedIcon={Checkmark}
                            sx={{ flex: 1 }}
                          />
                        ) : (
                          <Input
                            elementDescriptor={descriptors.configureDirectorySyncTokenInput}
                            value=''
                            readOnly
                            placeholder={t(
                              localizationKeys('configureDirectorySync.configureStep.formFieldInputPlaceholder__token'),
                            )}
                            sx={{ flex: 1 }}
                          />
                        )}
                        <Button
                          elementDescriptor={descriptors.configureDirectorySyncGenerateTokenButton}
                          variant='outline'
                          size='sm'
                          isLoading={card.isLoading}
                          onClick={() => void run(rotateToken)}
                          localizationKey={localizationKeys(
                            'configureDirectorySync.configureStep.actionLabel__generateToken',
                          )}
                          sx={{ flexShrink: 0 }}
                        />
                      </Flex>
                      <Flex
                        elementDescriptor={descriptors.configureDirectorySyncTokenNotice}
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
                          localizationKey={localizationKeys(
                            'configureDirectorySync.configureStep.notice__tokenShownOnce',
                          )}
                          sx={t => ({ fontSize: t.fontSizes.$sm })}
                        />
                      </Flex>
                    </Col>
                  </>
                )
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
              elementDescriptor={descriptors.configureDirectorySyncRetryButton}
              variant='outline'
              size='sm'
              onClick={() => void run(createDirectory)}
              localizationKey={localizationKeys('configureDirectorySync.configureStep.actionLabel__retry')}
              sx={{ alignSelf: 'start' }}
            />
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
