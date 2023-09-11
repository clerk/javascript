import { createContextAndHook } from '@clerk/shared';
import type { FieldId } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { useState } from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Form as FormPrim, localizationKeys } from '../customizables';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { useCardState } from './contexts';
import { Field } from './FieldControl';
import { FormControl } from './FormControl';

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
        gap={4}
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
    <>
      <Button
        elementDescriptor={descriptors.formButtonPrimary}
        block
        textVariant='buttonExtraSmallBold'
        isLoading={isLoading}
        isDisabled={isDisabled}
        type='submit'
        {...props}
        localizationKey={props.localizationKey || localizationKeys('formButtonPrimary')}
      />
    </>
  );
};

const FormReset = (props: PropsOfComponent<typeof Button>) => {
  const { isLoading, isDisabled } = useFormState();
  return (
    <>
      <Button
        elementDescriptor={descriptors.formButtonReset}
        block
        variant='ghost'
        textVariant='buttonExtraSmallBold'
        type='reset'
        isDisabled={isLoading || isDisabled}
        {...props}
      />
    </>
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

type CommonFieldRootProps = Omit<PropsOfComponent<typeof Field.Root>, 'children'>;

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
      <Field.Feedback />
    </Field.Root>
  );
};

const RadioGroup = (props: CommonFieldRootProps) => {
  const { radioOptions, ...fieldProps } = props;
  return (
    <Field.Root {...fieldProps}>
      <Col
        elementDescriptor={descriptors.formFieldRadioGroup}
        gap={2}
      >
        {radioOptions?.map(({ value, description, label }) => (
          <Field.RadioItem
            key={value}
            value={value}
            label={label}
            description={description}
          />
        ))}
      </Col>

      <Field.Feedback />
    </Field.Root>
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

const PlainInput = (props: CommonInputProps) => {
  return (
    <CommonInputWrapper {...props}>
      <Field.Input />
    </CommonInputWrapper>
  );
};

const PasswordInput = (props: CommonInputProps) => {
  return (
    <CommonInputWrapper {...props}>
      <Field.Input />
    </CommonInputWrapper>
  );
};

export const Form = {
  Root: FormRoot,
  ControlRow: FormControlRow,
  /**
   * @deprecated Use Form.PlainInput, Form.InputGroup, Form.RadioGroup, Form.PasswordInput
   */
  Control: FormControl,
  PlainInput,
  PasswordInput,
  InputGroup,
  RadioGroup,
  SubmitButton: FormSubmit,
  ResetButton: FormReset,
};

export { useFormState };
