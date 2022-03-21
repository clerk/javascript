import cn from 'classnames';
import React from 'react';

// @ts-ignore
import styles from './TextArea.module.scss';

export type TextAreaProps = {
  ref?: React.Ref<HTMLTextAreaElement>;
  name?: string;
  value?: string;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
  handleChange?: (el: HTMLTextAreaElement) => void;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.AriaAttributes;

export const TextArea: React.FC<TextAreaProps> = React.forwardRef(
  ({ name, value, handleChange, className, hasError, ...rest }: TextAreaProps, ref) => {
    function onChange(e: React.ChangeEvent) {
      e.persist();
      if (typeof handleChange === 'function') {
        handleChange(e.target as HTMLTextAreaElement);
      }
    }

    return (
      <textarea
        {...rest}
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(styles.textArea, { [styles.error]: hasError }, className)}
      />
    );
  },
);

TextArea.displayName = 'TextArea';
