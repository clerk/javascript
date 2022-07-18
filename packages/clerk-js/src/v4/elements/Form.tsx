import React from 'react';

import { Button, descriptors, Flex, Form as FormPrim } from '../customizables';
import { useLoadingStatus } from '../hooks';
import { PropsOfComponent } from '../styledSystem';
import { createContextAndHook } from '../utils';
import { useCardState } from './contexts';
import { FormControl } from './FormControl';

const [FormState, useFormState] = createContextAndHook<{ isLoading: boolean; isDisabled: boolean }>('FormState');

type FormProps = PropsOfComponent<typeof FormPrim>;

const FormRoot = (props: FormProps): JSX.Element => {
  const card = useCardState();
  const status = useLoadingStatus();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!props.onSubmit) {
      return;
    }
    try {
      card.setLoading();
      status.setLoading();
      await props.onSubmit(e);
    } finally {
      card.setIdle();
      status.setIdle();
    }
  };

  const value = React.useMemo(() => {
    return { value: { isLoading: status.isLoading, isDisabled: card.isLoading || status.isLoading } };
  }, [card.isLoading, status.isLoading]);

  return (
    <FormState.Provider value={value}>
      <FormPrim
        elementDescriptor={descriptors.form}
        gap={4}
        {...props}
        onSubmit={onSubmit}
      />
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
        // Explicitly remove type=submit or type=button
        type={undefined}
        {...props}
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

const FormControlRow = (props: React.PropsWithChildren<any>) => {
  return (
    <Flex
      elementDescriptor={descriptors.formFieldRow}
      justify='between'
      gap={4}
      {...props}
    />
  );
};

export const Form = {
  Root: FormRoot,
  ControlRow: FormControlRow,
  Control: FormControl,
  SubmitButton: FormSubmit,
  ResetButton: FormReset,
};
