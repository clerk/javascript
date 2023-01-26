import React from 'react';

import type { ThemableCssProp } from '../styledSystem';
import { useAppearance } from './AppearanceContext';
import { appendEmojiSeparator, generateClassName } from './classGeneration';
import type { ElementDescriptor, ElementId } from './elementDescriptors';

type Customizable<T = Record<never, never>> = T & {
  elementDescriptor?: ElementDescriptor | Array<ElementDescriptor | undefined>;
  elementId?: ElementId;
  css?: never;
  sx?: ThemableCssProp;
};

type CustomizablePrimitive<T> = React.FunctionComponent<Customizable<T>>;

type MakeCustomizableOptions = {
  defaultStyles?: ThemableCssProp;
  defaultDescriptor?: ElementDescriptor;
};

export const makeCustomizable = <P,>(
  Component: React.FunctionComponent<P>,
  options?: MakeCustomizableOptions,
): CustomizablePrimitive<P> => {
  const { defaultStyles, defaultDescriptor } = options || {};

  const customizableComponent = React.forwardRef((props: Customizable<any>, ref) => {
    const { elementDescriptor, elementId, sx, className, ...restProps } = props;
    const { parsedElements } = useAppearance();
    const descriptors = [
      defaultDescriptor,
      ...(Array.isArray(elementDescriptor) ? elementDescriptor : [elementDescriptor]),
    ].filter(s => s);

    if (!descriptors.length) {
      return (
        <Component
          css={sx}
          {...restProps}
          className={className}
          ref={ref}
        />
      );
    }

    const generatedStyles = generateClassName(parsedElements, descriptors, elementId, props);
    const generatedClassname = appendEmojiSeparator(generatedStyles.className, className);
    generatedStyles.css.unshift(defaultStyles, sx);

    return (
      <Component
        // Propagate elementId so subsequent HOCs can use it
        elementId={elementId}
        css={generatedStyles.css}
        // always first for better readability in the DOM
        className={generatedClassname}
        {...restProps}
        ref={ref}
      />
    );
  });

  const displayName = Component.displayName || Component.name || 'Component';
  customizableComponent.displayName = `Customizable${displayName}`.replace('_', '');
  return customizableComponent as CustomizablePrimitive<P>;
};
