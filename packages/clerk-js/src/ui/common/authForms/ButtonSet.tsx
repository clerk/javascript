import React from 'react';
import { svgUrl } from 'ui/common/constants';
import { ButtonWithSpinner } from '@clerk/shared/components/button';

type Flow = 'sign-in' | 'sign-up';

export interface ButtonSetOptions {
  id: string;
  name: string;
  strategy: string;
}

export type ButtonSetProps<T> = {
  buttonClassName?: string;
  className?: string;
  error?: string;
  flow: Flow;
  handleClick: (e: React.MouseEvent, provider: T) => void;
  options: ButtonSetOptions[];
};

export function ButtonSet<T>({
  buttonClassName,
  className,
  error,
  flow,
  handleClick,
  options,
}: ButtonSetProps<T>): JSX.Element | null {
  const [isLoading, setIsLoading] = React.useState(() =>
    options.map(() => false),
  );
  const alreadyLoading = isLoading.some(o => o);

  React.useEffect(() => {
    if (!alreadyLoading) {
      return;
    }
    setIsLoading(options.map(() => false));
  }, [alreadyLoading, error, options]);

  const handleOptionClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    i: number,
  ) => {
    handleClick(e, (options[i].strategy as unknown) as T);
    setIsLoading(() => {
      const newState = [...isLoading];
      newState[i] = true;
      return newState;
    });
  };

  if (options.length <= 0) {
    return null;
  }

  return (
    <div className={className}>
      {options.map(({ id, name }, index: number) => {
        return (
          <ButtonWithSpinner
            key={`button-set-${id}-${index}`}
            isLoading={isLoading[index]}
            disabled={alreadyLoading}
            onClick={e => handleOptionClick(e, index)}
            flavor='outline'
            className={buttonClassName}
          >
            <img alt={name} src={svgUrl(id)} />
            <span>{getButtonLabel(flow, name)}</span>
          </ButtonWithSpinner>
        );
      })}
    </div>
  );
}

function getButtonLabel(flow: Flow, provider: string) {
  switch (flow) {
    case 'sign-up':
      return `Sign up with ${provider}`;
    case 'sign-in':
    default:
      return `Sign in with ${provider}`;
  }
}
