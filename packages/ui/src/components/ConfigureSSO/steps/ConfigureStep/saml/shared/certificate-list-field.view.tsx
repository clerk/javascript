import type { LocalizationKey } from '@/customizables';
import { Badge, Box, Button, Col, descriptors, Flex, Icon, localizationKeys, Span, Text } from '@/customizables';
import { Field } from '@/elements/FieldControl';
import { Tooltip } from '@/elements/Tooltip';
import { ArrowUpTray, Close, ExclamationTriangle } from '@/icons';

import type { IdpCertificateStatus } from '../../../../domain/idpCertificates';
import type { useCertificateListFieldController } from './certificate-list-field.controller';

const CERTIFICATE_FILE_TYPES = '.pem,.key,.crt,.cer,.cert';

export const CertificateListFieldView = ({
  field,
  certificates,
  certificateViews,
  labels,
  canRemove,
  canAdd,
  removeCertificateLabel,
  inputRef,
  onFileSelected,
  onOpenPicker,
  onRemove,
}: ReturnType<typeof useCertificateListFieldController>): JSX.Element => (
  <Box>
    <Field.Root {...field.props}>
      <Col gap={2}>
        <Field.LabelRow>
          <Field.Label />
        </Field.LabelRow>

        <input
          ref={inputRef}
          type='file'
          accept={CERTIFICATE_FILE_TYPES}
          multiple={false}
          style={{ display: 'none' }}
          onChange={e => void onFileSelected(e.target.files?.[0] ?? null)}
        />

        {certificates.length > 0 && (
          <Col
            elementDescriptor={descriptors.configureSSOCertificateList}
            gap={2}
          >
            {certificateViews.map(({ entry, status, expiryLocalizationKey }, index) => (
              <Flex
                key={entry.certificate}
                elementDescriptor={descriptors.configureSSOCertificateListItem}
                align='center'
                gap={2}
                sx={theme => ({
                  padding: theme.space.$2,
                  borderRadius: theme.radii.$md,
                  borderWidth: theme.borderWidths.$normal,
                  borderStyle: theme.borderStyles.$solid,
                  borderColor: theme.colors.$borderAlpha100,
                })}
              >
                <Col
                  gap={1}
                  sx={{ minWidth: 0, flex: 1 }}
                >
                  <Flex
                    align='center'
                    gap={2}
                    sx={{ minWidth: 0 }}
                  >
                    <Text
                      elementDescriptor={descriptors.configureSSOCertificateListItemBody}
                      as='span'
                      colorScheme='secondary'
                      variant='buttonSmall'
                      sx={{
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.certificate}
                    </Text>
                    {index === 0 && (
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Span
                            tabIndex={0}
                            sx={theme => ({ display: 'inline-flex', borderRadius: theme.radii.$sm })}
                          >
                            <Badge
                              elementDescriptor={descriptors.configureSSOCertificatePrimaryBadge}
                              localizationKey={localizationKeys('configureSSO.signingCertificates.primary')}
                            />
                          </Span>
                        </Tooltip.Trigger>
                        <Tooltip.Content text={localizationKeys('configureSSO.signingCertificates.primaryTooltip')} />
                      </Tooltip.Root>
                    )}
                  </Flex>
                  <CertificateExpiry
                    status={status}
                    expiryLocalizationKey={expiryLocalizationKey}
                  />
                </Col>

                <Button
                  elementDescriptor={descriptors.configureSSOCertificateListItemRemoveButton}
                  variant='ghost'
                  colorScheme='neutral'
                  aria-label={removeCertificateLabel}
                  isDisabled={!canRemove}
                  onClick={() => onRemove(entry.certificate)}
                  sx={theme => ({ padding: theme.space.$1 })}
                >
                  <Icon
                    icon={Close}
                    size='xs'
                  />
                </Button>
              </Flex>
            ))}
          </Col>
        )}

        <Button
          elementDescriptor={descriptors.configureSSOCertificateUploadButton}
          size='xs'
          variant='outline'
          onClick={onOpenPicker}
          isDisabled={!canAdd}
          sx={{ alignSelf: 'flex-start' }}
        >
          <Icon
            icon={ArrowUpTray}
            size='sm'
            colorScheme='neutral'
            sx={theme => ({ marginInlineEnd: theme.space.$1 })}
          />
          <Text
            as='span'
            localizationKey={
              certificates.length > 0
                ? localizationKeys('configureSSO.signingCertificates.addCertificate')
                : labels.uploadFile
            }
          />
        </Button>
      </Col>
      <Field.Feedback />
    </Field.Root>
  </Box>
);

const CertificateExpiry = ({
  status,
  expiryLocalizationKey,
}: {
  status: IdpCertificateStatus;
  expiryLocalizationKey: LocalizationKey;
}): JSX.Element => {
  const showsAlert = status === 'expired' || status === 'expiring';
  const colorScheme = status === 'expired' ? 'danger' : status === 'expiring' ? 'warning' : 'secondary';

  return (
    <Flex
      elementDescriptor={descriptors.configureSSOCertificateListItemExpiry}
      align='center'
      gap={1}
    >
      {showsAlert && (
        <Icon
          icon={ExclamationTriangle}
          size='sm'
          colorScheme={status === 'expired' ? 'danger' : 'warning'}
        />
      )}
      <Text
        as='span'
        colorScheme={colorScheme}
        variant='caption'
        localizationKey={expiryLocalizationKey}
      />
    </Flex>
  );
};
