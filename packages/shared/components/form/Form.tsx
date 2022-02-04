import cn from 'classnames';
import React from 'react';

import { useMounted } from '../../hooks';
import { Button, ButtonWithSpinner } from '../button';
// @ts-ignore
import styles from './Form.module.scss';

export type FormProps = {
  ref?: React.Ref<HTMLFormElement>;
  className?: string;
  submitButtonLabel?: string;
  resetButtonLabel?: string;
  submitButton?: React.ReactNode;
  submitButtonClassName?: string;
  submitButtonDisabled?: boolean;
  resetButton?: React.ReactNode;
  resetButtonClassName?: string;
  buttonGroupClassName?: string;
  buttonGroupToTheRight?: boolean;
  handleReset?: (
    e: React.FormEvent<HTMLFormElement>,
  ) => Promise<unknown> | unknown;
  handleSubmit?: (
    e: React.FormEvent<HTMLFormElement>,
  ) => Promise<unknown> | unknown;
  children: React.ReactElement | React.ReactElement[];
};

export const Form: React.FC<FormProps> = React.forwardRef(
  (
    {
      className,
      submitButtonLabel = 'Submit',
      resetButtonLabel = 'Reset',
      handleReset,
      handleSubmit,
      submitButton,
      submitButtonClassName,
      submitButtonDisabled = false,
      resetButton,
      resetButtonClassName,
      buttonGroupClassName,
      buttonGroupToTheRight,
      children,
    }: FormProps,
    forwardRef: React.Ref<HTMLFormElement>,
  ) => {
    const isMounted = useMounted();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const fieldsetRef = React.useRef<HTMLFieldSetElement>();

    // make autofocusing reliable for forms in modals
    // add data-no-focus="true" to any element that should not be auto focused
    React.useEffect(() => {
      const el = fieldsetRef.current?.querySelector(
        'select:not([data-no-focus="true"]),input:not([data-no-focus="true"])',
      ) as HTMLInputElement | HTMLSelectElement;
      setTimeout(() => el?.focus(), 0);
    }, []);

    if (!Array.isArray(children)) {
      children = [children];
    }

    if (!submitButton && typeof handleSubmit === 'function') {
      submitButton = (
        <ButtonWithSpinner
          isLoading={isSubmitting}
          className={submitButtonClassName}
          disabled={submitButtonDisabled}
        >
          {submitButtonLabel}
        </ButtonWithSpinner>
      );
    }

    if (!resetButton && typeof handleReset === 'function') {
      resetButton = (
        <Button type='reset' flavor='text' className={resetButtonClassName}>
          {resetButtonLabel}
        </Button>
      );
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (typeof handleSubmit === 'function') {
        setIsSubmitting(true);
        await handleSubmit(e);
        if (isMounted.current) {
          setIsSubmitting(false);
        }
      }
    };

    const handleFormReset = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (typeof handleReset === 'function') {
        await handleReset(e);
      }
    };

    let fieldsetCount = 0;

    return (
      <form
        ref={forwardRef}
        className={cn(styles.form, className)}
        onReset={handleFormReset}
        onSubmit={handleFormSubmit}
      >
        {children.reduce(
          (
            memo: Array<React.ReactElement<HTMLFieldSetElement>>,
            child,
            index,
          ) => {
            if (child) {
              fieldsetCount++;
              memo.push(
                // @ts-ignore
                <fieldset key={index} ref={index === 0 ? fieldsetRef : null}>
                  {child}
                </fieldset>,
              );
            }
            return memo;
          },
          [],
        )}
        {(submitButton || resetButton) && fieldsetCount > 0 && (
          <fieldset
            className={cn(styles.group, buttonGroupClassName, {
              [styles.reversed]:
                (submitButton && resetButton) || buttonGroupToTheRight,
            })}
            disabled={isSubmitting}
          >
            {submitButton}
            {resetButton}
          </fieldset>
        )}
      </form>
    );
  },
);
Form.displayName = 'Form';
