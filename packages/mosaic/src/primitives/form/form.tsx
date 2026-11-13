'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../utils';

/** Props for {@link Form}. */
export type FormProps = ComponentProps<'form'>;

/**
 * A `<form>` that skips the browser's validation popup. Controls keep `required` and `type` for
 * assistive tech and keyboards; validation and its messages belong to the caller.
 *
 * @example
 * <Form onSubmit={handleSubmit}>…</Form>
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(props, ref) {
  const { render, ...otherProps } = props;

  return useRender({
    defaultTagName: 'form',
    render,
    ref,
    props: { ...otherProps, noValidate: true },
  });
});
