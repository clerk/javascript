import { Box, Col, descriptors, FormLabel, localizationKeys, Text } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { ChevronUpDown } from '@/ui/icons';
import { mqu } from '@/ui/styledSystem';

import type { CreateAPIKeyData } from './api-keys.types';

export const CreateAPIKeyView = ({ controller }: { controller: CreateAPIKeyData }) => (
  <FormContainer
    headerTitle={localizationKeys('apiKeys.formTitle')}
    headerSubtitle={localizationKeys('apiKeys.formHint')}
    elementDescriptor={descriptors.apiKeysCreateForm}
  >
    <Form.Root onSubmit={controller.handleSubmit}>
      <Box
        sx={t => ({
          gap: t.space.$4,
          display: 'flex',
          flexDirection: 'row',
          [mqu.sm]: { flexDirection: 'column' },
        })}
      >
        <Form.ControlRow
          sx={{ flex: 1 }}
          elementId={controller.nameField.id}
          elementDescriptor={descriptors.apiKeysCreateFormNameInput}
        >
          <Form.PlainInput {...controller.nameField.props} />
        </Form.ControlRow>
        <Col
          sx={{ flex: 1, width: '100%' }}
          gap={2}
          elementDescriptor={descriptors.apiKeysCreateFormExpirationInput}
        >
          <FormLabel
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}
            htmlFor='expiration-field'
          >
            <Text
              as='span'
              variant='subtitle'
              localizationKey={localizationKeys('formFieldLabel__apiKeyExpiration')}
            />
            <Text
              variant='caption'
              colorScheme='secondary'
              localizationKey={localizationKeys('formFieldHintText__optional')}
            />
          </FormLabel>
          <Select
            elementId='apiKeyExpiration'
            options={controller.expirationOptions}
            value={controller.selectedExpiration?.value ?? ''}
            onChange={controller.setSelectedExpiration}
            placeholder={controller.expirationPlaceholder}
            referenceElement={controller.expirationButtonRef}
          >
            <SelectButton
              ref={controller.expirationButtonRef}
              icon={ChevronUpDown}
              sx={t => ({
                justifyContent: 'space-between',
                backgroundColor: t.colors.$colorBackground,
              })}
              aria-labelledby='expiration-field'
              id='expiration-field'
            />
            <SelectOptionList
              sx={t => ({
                paddingBlock: t.space.$1,
                color: t.colors.$colorForeground,
              })}
            />
          </Select>
          <Text
            variant='caption'
            colorScheme='secondary'
            localizationKey={controller.expirationCaption}
            elementDescriptor={descriptors.apiKeysCreateFormExpirationCaption}
          />
        </Col>
      </Box>

      {controller.showDescription && (
        <Col
          sx={t => ({
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$borderAlpha100,
            paddingTop: t.space.$4,
            paddingBottom: t.space.$4,
          })}
        >
          <Form.ControlRow
            elementId={controller.descriptionField.id}
            elementDescriptor={descriptors.apiKeysCreateFormDescriptionInput}
          >
            <Form.PlainInput {...controller.descriptionField.props} />
          </Form.ControlRow>
        </Col>
      )}

      <FormButtons
        submitLabel={localizationKeys('apiKeys.formButtonPrimary__add')}
        isDisabled={!controller.canSubmit}
        onReset={controller.closeCard}
        isLoading={controller.isLoading}
        elementDescriptor={descriptors.apiKeysCreateFormSubmitButton}
      />
    </Form.Root>
  </FormContainer>
);
