import React from 'react';

import { useAppearance } from '../customizables';

export const SocialButtonsReversibleContainer = (props: React.PropsWithChildren<{}>) => {
  const appearance = useAppearance();
  return (
    <ReversibleContainer
      {...props}
      reverse={appearance.parsedLayout.socialButtonsPlacement === 'bottom'}
    />
  );
};

export const ReversibleContainer = (props: React.PropsWithChildren<{ reverse?: boolean }>) => {
  const { children, reverse } = props;
  return <>{reverse ? React.Children.toArray(children).reverse() : children}</>;
};
