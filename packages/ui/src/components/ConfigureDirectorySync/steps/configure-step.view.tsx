import type { LocalizationKey } from '@/customizables';
import { Badge, Button, Col, descriptors, Flex, Icon, Input, localizationKeys, Spinner, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Collapsible } from '@/elements/Collapsible';
import { Checkmark, ChevronDown, Clipboard, ExclamationTriangle } from '@/icons';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { GoogleCredentialsForm } from '../GoogleCredentialsForm';
import type { useConfigureStepController } from './configure-step.controller';
import type { useConfigureStepModel } from './configure-step.model';

const FieldLabel = ({ id, localizationKey }: { id: string; localizationKey: LocalizationKey }): JSX.Element => (
  <Text
    elementDescriptor={descriptors.configureDirectorySyncFieldLabel}
    elementId={descriptors.configureDirectorySyncFieldLabel.setId(id)}
    as='span'
    localizationKey={localizationKey}
    sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
  />
);

export const ConfigureStepView = ({
  connection,
  providerName,
  instructions,
  directory,
  revealedToken,
  isPull,
  credentials,
  canProvision,
  tokenPlaceholder,
  error,
  isLoading,
  isInstructionsOpen,
  toggleInstructions,
  generateToken,
  retryCreateDirectory,
  onContinue,
}: Pick<
  ReturnType<typeof useConfigureStepModel>,
  | 'connection'
  | 'providerName'
  | 'instructions'
  | 'directory'
  | 'revealedToken'
  | 'isPull'
  | 'credentials'
  | 'canProvision'
  | 'tokenPlaceholder'
> &
  ReturnType<typeof useConfigureStepController>): JSX.Element => {
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
                    localizationKey={providerName}
                    sx={t => ({ fontWeight: t.fontWeights.$medium })}
                  >
                    {connection.name}
                  </Text>

                  {connection.domains.length > 0 && (
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
                      {connection.domains.map(domain => (
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
                      onClick={() => toggleInstructions()}
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
                          padding: t.space.$4,
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
                  <GoogleCredentialsForm state={credentials} />
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
                            placeholder={tokenPlaceholder}
                            sx={{ flex: 1 }}
                          />
                        )}
                        <Button
                          elementDescriptor={descriptors.configureDirectorySyncGenerateTokenButton}
                          variant='outline'
                          size='sm'
                          isLoading={isLoading}
                          onClick={generateToken}
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
                !error && (
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

          {error && (
            <Alert
              variant='danger'
              title={error}
            />
          )}

          {!directory && canProvision && error && (
            <Button
              elementDescriptor={descriptors.configureDirectorySyncRetryButton}
              variant='outline'
              size='sm'
              onClick={retryCreateDirectory}
              localizationKey={localizationKeys('configureDirectorySync.configureStep.actionLabel__retry')}
              sx={{ alignSelf: 'start' }}
            />
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Continue
          onClick={onContinue}
          // For a pull directory this button is the submit, so it waits on the
          // form being complete rather than just on the directory existing.
          isDisabled={!directory || (isPull && !credentials.canContinue)}
          isLoading={isPull && isLoading}
        />
      </Step.Footer>
    </>
  );
};
