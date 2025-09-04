import React from 'react';

import { useAppearance } from '../customizables';
import { Divider } from './Divider';

export const SocialButtonsReversibleContainerWithDivider = (props: React.PropsWithChildren) => {
  const appearance = useAppearance();
  const childrenWithDivider = interleaveElementInArray(React.Children.toArray(props.children), i => (
    <Divider key={`divider${i}`} />
  ));

  return (
    <ReversibleContainer
      reverse={appearance.parsedLayout.socialButtonsPlacement === 'bottom'}
      {...props}
    >
      {childrenWithDivider}
    </ReversibleContainer>
  );
};

const ReversibleContainer = (props: React.PropsWithChildren<{ reverse?: boolean }>) => {
  const { children, reverse } = props;
  return <>{reverse ? React.Children.toArray(children).reverse() : children}</>;
};

const interleaveElementInArray = <T, A extends T[]>(arr: A, generator: (i: number) => any): A => {
  return arr.reduce((acc, child, i) => {
    return i === arr.length - 1 ? [...acc, child] : [...acc, child, generator(i)];
  }, [] as any);
};
