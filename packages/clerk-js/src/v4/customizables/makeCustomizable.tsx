import React from 'react';

import { ThemableCssProp } from '../styledSystem';
import { useAppearance } from './AppearanceContext';
import { appendEmojiSeparator, generateClassName } from './classGeneration';
import { ElementDescriptor, ElementId } from './elementDescriptors';

type Customizable<T = {}> = T & {
  elementDescriptor?: ElementDescriptor;
  elementId?: ElementId;
  css?: never;
  sx?: ThemableCssProp;
};

type CustomizablePrimitive<T> = React.FunctionComponent<Customizable<T>>;

type MakeCustomizableOptions = {
  defaultStyles: ThemableCssProp;
};

export const makeCustomizable = <P,>(
  Component: React.FunctionComponent<P>,
  options?: MakeCustomizableOptions,
): CustomizablePrimitive<P> => {
  const { defaultStyles } = options || {};
  const customizableComponent = React.forwardRef((props: Customizable<any>, ref) => {
    const { elementDescriptor, elementId, sx, className, ...restProps } = props;
    const { parsedElements } = useAppearance();

    if (!elementDescriptor) {
      return (
        <Component
          css={sx}
          {...restProps}
          className={className}
          ref={ref}
        />
      );
    }

    const generatedStyles = generateClassName(parsedElements, elementDescriptor, elementId, props);
    const generatedClassname = appendEmojiSeparator(generatedStyles.className, className);
    generatedStyles.css.unshift(defaultStyles, sx);

    return (
      <Component
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
