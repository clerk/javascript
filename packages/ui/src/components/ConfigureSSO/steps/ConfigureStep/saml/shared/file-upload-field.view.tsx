import { Badge, Box, Button, Col, descriptors, Flex, Icon, Text } from '@/customizables';
import { Field } from '@/elements/FieldControl';
import { ArrowUpTray, Close } from '@/icons';

import type { useFileUploadFieldController } from './file-upload-field.controller';

export const FileUploadFieldView = ({
  field,
  file,
  existingFilePresent,
  labels,
  accept,
  removeFileLabel,
  inputRef,
  onInputChange,
  onOpenPicker,
  onRemove,
}: ReturnType<typeof useFileUploadFieldController>): JSX.Element => (
  <Box>
    <Field.Root {...field.props}>
      <Col gap={2}>
        <Field.LabelRow>
          <Field.Label />
        </Field.LabelRow>

        <input
          ref={inputRef}
          type='file'
          accept={accept}
          multiple={false}
          style={{ display: 'none' }}
          onChange={onInputChange}
        />

        {file === null ? (
          <Flex
            align='center'
            gap={2}
            sx={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}
          >
            {existingFilePresent && (
              <Badge
                elementDescriptor={descriptors.configureSSOCertificateFileBadge}
                localizationKey={labels.fileUploaded}
              />
            )}
            <Button
              elementDescriptor={descriptors.configureSSOCertificateUploadButton}
              size='xs'
              variant='outline'
              onClick={onOpenPicker}
            >
              <Icon
                icon={ArrowUpTray}
                size='sm'
                colorScheme='neutral'
                sx={theme => ({ marginInlineEnd: theme.space.$1 })}
              />
              <Text
                as='span'
                localizationKey={existingFilePresent ? labels.replaceFile : labels.uploadFile}
              />
            </Button>
          </Flex>
        ) : (
          <Flex
            align='center'
            gap={2}
            sx={theme => ({ paddingTop: theme.space.$1, paddingBottom: theme.space.$1 })}
          >
            <Text
              elementDescriptor={descriptors.configureSSOCertificateFileName}
              as='span'
              colorScheme='secondary'
              variant='buttonSmall'
            >
              {file.name}
            </Text>

            <Button
              elementDescriptor={descriptors.configureSSOCertificateRemoveButton}
              variant='ghost'
              colorScheme='neutral'
              aria-label={removeFileLabel}
              onClick={onRemove}
              sx={theme => ({ padding: theme.space.$1 })}
            >
              <Icon
                icon={Close}
                size='xs'
              />
            </Button>
          </Flex>
        )}
      </Col>
      <Field.Feedback />
    </Field.Root>
  </Box>
);
