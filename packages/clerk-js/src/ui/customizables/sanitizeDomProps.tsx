import React from 'react';

/**
 * Removes any non-native attributes before the components gets committed to the DOM
 * simply by destructuring the unwanted props out of `props`
 */
export const sanitizeDomProps = <P extends React.FunctionComponent<any>>(Component: P): P => {
  const component = React.forwardRef((props: any, ref) => {
    const { elementId, elementDescriptor, localizationKey, ...restProps } = props;
    return (
      <Component
        {...restProps}
        ref={ref}
      />
    );
  });
  return component as unknown as P;
};
