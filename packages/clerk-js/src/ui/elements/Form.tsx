import { createContextAndHook } from '@clerk/shared/react';
import type { FieldId } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { forwardRef, useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Form as FormPrim, FormLabel, localizationKeys, Text } from '../customizables';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import type { OTPInputProps } from './CodeControl';
import { useCardState } from './contexts';
import { Field } from './FieldControl';

const [FormState, useFormState] = createContextAndHook<{
  isLoading: boolean;
  isDisabled: boolean;
  submittedWithEnter: boolean;
}>('FormState');

type FormProps = PropsOfComponent<typeof FormPrim>;

const FormRoot = (props: FormProps): JSX.Element => {
  const card = useCardState();
  const status = useLoadingStatus();
  const [submittedWithEnter, setSubmittedWithEnter] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!props.onSubmit) {
      return;
    }
    try {
      card.setLoading();
      status.setLoading();
      setSubmittedWithEnter(true);
      await props.onSubmit(e);
    } finally {
      card.setIdle();
      status.setIdle();
    }
  };

  const value = React.useMemo(() => {
    return {
      value: { isLoading: status.isLoading, isDisabled: card.isLoading || status.isLoading, submittedWithEnter },
    };
  }, [card.isLoading, status.isLoading, submittedWithEnter]);

  return (
    <FormState.Provider value={value}>
      <FormPrim
        elementDescriptor={descriptors.form}
        gap={6}
        {...props}
        onSubmit={onSubmit}
      >
        {/*
        We add a submit button as the first element of the form as a workaround to support
        submitting the form via hitting enter on a field, without explicitly adding type=submit
        to the other buttons, to avoid conflicts with css resets like tailwind's.
        This button needs to always be the first element of the form.
        */}
        <button
          type='submit'
          aria-hidden
          // Avoid using display:none because safari will ignore the button
          style={{ visibility: 'hidden', position: 'absolute' }}
        />
        {props.children}
      </FormPrim>
    </FormState.Provider>
  );
};

const FormSubmit = (props: PropsOfComponent<typeof Button>) => {
  const { isLoading, isDisabled } = useFormState();
  return (
    <Button
      elementDescriptor={descriptors.formButtonPrimary}
      block
      textVariant='buttonLarge'
      isLoading={isLoading}
      isDisabled={isDisabled}
      type='submit'
      {...props}
      localizationKey={props.localizationKey || localizationKeys('formButtonPrimary')}
    />
  );
};

const FormReset = (props: PropsOfComponent<typeof Button>) => {
  const { isLoading, isDisabled } = useFormState();
  return (
    <Button
      elementDescriptor={descriptors.formButtonReset}
      block
      variant='ghost'
      type='reset'
      isDisabled={isLoading || isDisabled}
      {...props}
    />
  );
};

const FormControlRow = (props: Omit<PropsOfComponent<typeof Flex>, 'elementId'> & { elementId?: FieldId }) => {
  const { elementId, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.formFieldRow}
      elementId={descriptors.formFieldRow.setId(elementId)}
      justify='between'
      gap={4}
      {...rest}
    />
  );
};

type CommonFieldRootProps = Omit<PropsOfComponent<typeof Field.Root>, 'children' | 'elementDescriptor' | 'elementId'>;

type CommonInputProps = CommonFieldRootProps & {
  isOptional?: boolean;
  actionLabel?: string | LocalizationKey;
  onActionClicked?: React.MouseEventHandler;
  icon?: React.ComponentType;
};

const CommonInputWrapper = (props: PropsWithChildren<CommonInputProps>) => {
  const { isOptional, icon, actionLabel, children, onActionClicked, ...fieldProps } = props;
  return (
    <Field.Root {...fieldProps}>
      <Col
        elementDescriptor={descriptors.formField}
        elementId={descriptors.formField.setId(fieldProps.id)}
        sx={{ position: 'relative', flex: '1 1 auto' }}
      >
        <Flex
          direction='col'
          sx={t => ({ gap: t.space.$2 })}
        >
          <Field.LabelRow>
            <Field.Label />
            <Field.LabelIcon icon={icon} />
            {!actionLabel && isOptional && <Field.AsOptional />}
            {actionLabel && (
              <Field.Action
                localizationKey={actionLabel}
                onClick={onActionClicked}
              />
            )}
            <Field.Action />
          </Field.LabelRow>

          {children}
        </Flex>

        <Field.Feedback />
      </Col>
    </Field.Root>
  );
};

const PlainInput = (props: CommonInputProps) => {
  return (
    <CommonInputWrapper {...props}>
      <Field.Input />
    </CommonInputWrapper>
  );
};

const PasswordInput = forwardRef<HTMLInputElement, CommonInputProps>((props, ref) => {
  return (
    <CommonInputWrapper {...props}>
      <Field.PasswordInput ref={ref} />
    </CommonInputWrapper>
  );
});

const PhoneInput = (props: CommonInputProps) => {
  return (
    <CommonInputWrapper {...props}>
      <Field.PhoneInput />
    </CommonInputWrapper>
  );
};

const InputGroup = (
  props: CommonInputProps & {
    groupPrefix?: string;
    groupSuffix?: string;
  },
) => {
  const { groupSuffix, groupPrefix, ...fieldProps } = props;
  return (
    <CommonInputWrapper {...fieldProps}>
      <Field.InputGroup {...{ groupSuffix, groupPrefix }} />
    </CommonInputWrapper>
  );
};

const Checkbox = (
  props: CommonFieldRootProps & {
    description?: string | LocalizationKey;
    termsLink?: string;
    privacyLink?: string;
  },
) => {
  return (
    <Field.Root {...props}>
      {/*TODO: Create a descriptor for Checkbox wrapper*/}
      <Flex align='start'>
        <Field.CheckboxIndicator />
        <Field.CheckboxLabel description={props.description} />
      </Flex>
    </Field.Root>
  );
};

const LegalCheckbox = (
  props: CommonFieldRootProps & {
    description?: string | LocalizationKey;
  },
) => {
  return (
    <Field.Root {...props}>
      <Flex align='start'>
        <Field.CheckboxIndicator />
        <FormLabel
          elementDescriptor={descriptors.formFieldRadioLabel}
          htmlFor={props.itemID}
          sx={t => ({
            padding: `${t.space.$none} ${t.space.$2}`,
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <Text
            elementDescriptor={descriptors.formFieldRadioLabelTitle}
            variant='subtitle'
            localizationKey={props.label}
          />
        </FormLabel>
      </Flex>
    </Field.Root>
  );
};

const RadioGroup = (
  props: Omit<PropsOfComponent<typeof Field.Root>, 'infoText' | 'type' | 'validatePassword' | 'label' | 'placeholder'>,
) => {
  const { radioOptions, ...fieldProps } = props;
  return (
    <Field.Root {...fieldProps}>
      <Col
        elementDescriptor={descriptors.formFieldRadioGroup}
        gap={3}
      >
        {radioOptions?.map(({ value, description, label }) => (
          <Flex
            key={value}
            sx={t => ({
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$neutralAlpha100,
              borderRadius: t.radii.$md,
              padding: t.space.$2,
            })}
          >
            <Field.RadioItem
              value={value}
              label={label}
              description={description}
            />
          </Flex>
        ))}
      </Col>

      <Field.Feedback />
    </Field.Root>
  );
};

const OTPInput = (props: OTPInputProps) => {
  const { ref, ...restInputProps } = props.otpControl.otpInputProps;
  const { centerAlign = true } = props;
  return (
    // Use Field.Root in order to pass feedback down to Field.Feedback
    // @ts-ignore
    <Field.Root {...restInputProps}>
      <Field.OTPRoot {...props}>
        {/*TODO: Create a descriptor for OTP wrapper*/}
        <Col
          elementDescriptor={descriptors.form}
          gap={2}
          align={centerAlign ? 'center' : 'start'}
        >
          <Flex
            elementDescriptor={descriptors.otpCodeField}
            isLoading={props.isLoading}
            hasError={props.otpControl.otpInputProps.feedbackType === 'error'}
            direction='col'
          >
            <Field.OTPCodeControl ref={ref} />
            <Field.Feedback
              center
              elementDescriptors={{
                error: descriptors.otpCodeFieldErrorText,
              }}
            />
          </Flex>
          <Field.OTPResendButton />
        </Col>
      </Field.OTPRoot>
    </Field.Root>
  );
};

export const Form = {
  Root: FormRoot,
  ControlRow: FormControlRow,
  PlainInput,
  PasswordInput,
  PhoneInput,
  OTPInput,
  InputGroup,
  RadioGroup,
  Checkbox,
  LegalCheckbox: LegalCheckbox,
  SubmitButton: FormSubmit,
  ResetButton: FormReset,
};

export { useFormState };
