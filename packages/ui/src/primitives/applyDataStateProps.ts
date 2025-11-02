import type { StateProps } from '../styledSystem';

export const applyDataStateProps = (props: any) => {
  const { hasError, isDisabled, isLoading, isOpen, isActive, ...rest } = props as StateProps;
  return {
    'data-error': hasError || undefined,
    'data-disabled': isDisabled || undefined,
    'data-loading': isLoading || undefined,
    'data-open': isOpen || undefined,
    'data-active': isActive || undefined,
    ...rest,
  };
};
