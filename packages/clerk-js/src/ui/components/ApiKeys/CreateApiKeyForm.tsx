import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useApiKeysContext } from '@/ui/contexts';
import { Box, Col, descriptors, FormLabel, localizationKeys, Text, useLocalizations } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { ChevronUpDown } from '@/ui/icons';
import { mqu } from '@/ui/styledSystem';
import { useFormControl } from '@/ui/utils/useFormControl';

const EXPIRATION_VALUES = [null, '1d', '7d', '30d', '60d', '90d', '180d', '1y'] as const;

type Expiration = (typeof EXPIRATION_VALUES)[number];

type ExpirationOption = {
  value: Expiration;
  label: string;
};

export type OnCreateParams = {
  name: string;
  description?: string;
  secondsUntilExpiration: number | undefined;
};

interface CreateApiKeyFormProps {
  onCreate: (params: OnCreateParams, closeCardFn: () => void) => void;
  isSubmitting: boolean;
}

const EXPIRATION_DURATIONS: Record<Exclude<Expiration, null>, (date: Date) => void> = {
  '1d': date => date.setDate(date.getDate() + 1),
  '7d': date => date.setDate(date.getDate() + 7),
  '30d': date => date.setDate(date.getDate() + 30),
  '60d': date => date.setDate(date.getDate() + 60),
  '90d': date => date.setDate(date.getDate() + 90),
  '180d': date => date.setDate(date.getDate() + 180),
  '1y': date => date.setFullYear(date.getFullYear() + 1),
} as const;

const getExpirationLocalizationKey = (expiration: Expiration) => {
  switch (expiration) {
    case null:
      return 'apiKeys.formFieldOption__expiration__never';
    case '1d':
      return 'apiKeys.formFieldOption__expiration__1d';
    case '7d':
      return 'apiKeys.formFieldOption__expiration__7d';
    case '30d':
      return 'apiKeys.formFieldOption__expiration__30d';
    case '60d':
      return 'apiKeys.formFieldOption__expiration__60d';
    case '90d':
      return 'apiKeys.formFieldOption__expiration__90d';
    case '180d':
      return 'apiKeys.formFieldOption__expiration__180d';
    case '1y':
      return 'apiKeys.formFieldOption__expiration__1y';
  }
};

const getTimeLeftInSeconds = (expirationOption: Expiration): number | undefined => {
  if (!expirationOption) {
    return;
  }

  const now = new Date();
  const future = new Date(now);

  EXPIRATION_DURATIONS[expirationOption](future);
  return Math.floor((future.getTime() - now.getTime()) / 1000);
};

interface ExpirationSelectorProps {
  selectedExpiration: ExpirationOption | null;
  setSelectedExpiration: (value: ExpirationOption) => void;
}

const ExpirationSelector: React.FC<ExpirationSelectorProps> = ({ selectedExpiration, setSelectedExpiration }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number>();
  const { t } = useLocalizations();

  useLayoutEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, []);

  const expirationOptions = EXPIRATION_VALUES.map(value => ({
    value,
    label: t(localizationKeys(getExpirationLocalizationKey(value))),
  }));

  return (
    <Select
      elementId='apiKeyExpiration'
      options={expirationOptions}
      value={selectedExpiration?.value ?? ''}
      onChange={setSelectedExpiration}
      placeholder={t(localizationKeys('formFieldInputPlaceholder__apiKeyExpirationDate'))}
    >
      <SelectButton
        ref={buttonRef}
        icon={ChevronUpDown}
        sx={t => ({
          justifyContent: 'space-between',
          backgroundColor: t.colors.$colorBackground,
        })}
        aria-labelledby='expiration-field'
        id='expiration-field'
      >
        <Text>
          {selectedExpiration?.label || t(localizationKeys('formFieldInputPlaceholder__apiKeyExpirationDate'))}
        </Text>
      </SelectButton>
      <SelectOptionList
        sx={t => ({
          paddingBlock: t.space.$1,
          color: t.colors.$colorText,
          width: buttonWidth,
        })}
      />
    </Select>
  );
};

export const CreateApiKeyForm: React.FC<CreateApiKeyFormProps> = ({ onCreate, isSubmitting }) => {
  const [selectedExpiration, setSelectedExpiration] = useState<ExpirationOption | null>(null);
  const { close: closeCardFn } = useActionContext();
  const { showDescription = false } = useApiKeysContext();
  const { t } = useLocalizations();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyName'),
    isRequired: true,
  });

  const descriptionField = useFormControl('apiKeyDescription', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyDescription'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyDescription'),
    isRequired: false,
  });

  const canSubmit = nameField.value.length > 2;
  const expirationCaption = useMemo(() => {
    const timeLeftInSeconds = getTimeLeftInSeconds(selectedExpiration?.value ?? null);

    if (!selectedExpiration?.value || !timeLeftInSeconds) {
      return t(localizationKeys('apiKeys.formFieldCaption__expiration__never'));
    }

    const expirationDate = new Date(Date.now() + timeLeftInSeconds * 1000);
    return (
      t(localizationKeys('apiKeys.formFieldCaption__expiration__expiresOn')) +
      ' ' +
      expirationDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      })
    );
  }, [selectedExpiration?.value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      {
        name: nameField.value,
        description: descriptionField.value || undefined,
        secondsUntilExpiration: getTimeLeftInSeconds(selectedExpiration?.value ?? null),
      },
      closeCardFn,
    );
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('apiKeys.formTitle')}
      headerSubtitle={localizationKeys('apiKeys.formHint')}
      elementDescriptor={descriptors.apiKeysCreateForm}
    >
      <Form.Root onSubmit={handleSubmit}>
        <Box
          sx={t => ({
            gap: t.space.$4,
            display: 'flex',
            flexDirection: 'row',
            [mqu.sm]: {
              flexDirection: 'column',
            },
          })}
        >
          <Form.ControlRow
            sx={{ flex: 1 }}
            elementId={nameField.id}
            elementDescriptor={descriptors.apiKeysCreateFormNameInput}
          >
            <Form.PlainInput {...nameField.props} />
          </Form.ControlRow>
          <Col
            sx={{ flex: 1, width: '100%' }}
            gap={2}
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
              >
                Optional
              </Text>
            </FormLabel>
            <ExpirationSelector
              selectedExpiration={selectedExpiration}
              setSelectedExpiration={setSelectedExpiration}
            />
            <Text
              variant='caption'
              colorScheme='secondary'
              localizationKey={expirationCaption}
            />
          </Col>
        </Box>

        {showDescription && (
          <Col
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$neutralAlpha100,
              paddingTop: t.space.$4,
              paddingBottom: t.space.$4,
            })}
          >
            <Form.ControlRow
              elementId={descriptionField.id}
              elementDescriptor={descriptors.apiKeysCreateFormDescriptionInput}
            >
              <Form.PlainInput {...descriptionField.props} />
            </Form.ControlRow>
          </Col>
        )}

        <FormButtons
          submitLabel={localizationKeys('apiKeys.formButtonPrimary__add')}
          isDisabled={!canSubmit}
          onReset={closeCardFn}
          isLoading={isSubmitting}
          elementDescriptor={descriptors.apiKeysCreateFormSubmitButton}
        />
      </Form.Root>
    </FormContainer>
  );
};
