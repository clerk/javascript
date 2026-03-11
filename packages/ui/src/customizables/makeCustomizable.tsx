import React from 'react';

import type { InternalTheme, ThemableCssProp } from '../styledSystem';
import { stripDecorativeStyles, type StripOptions } from '../styledSystem/stripDecorativeStyles';
import { useAppearance } from './AppearanceContext';
import { appendEmojiSeparator, generateClassName } from './classGeneration';
import type { ElementDescriptor, ElementId } from './elementDescriptors';

type Customizable<T = Record<never, never>> = T & {
  /**
   * elementDescriptor - An optional property that can be an `ElementDescriptor` or an array of `ElementDescriptor` or `undefined`. This property is used to describe the elements for styling purposes.
   *
   * @example
   * ```tsx
   * <Box
   *   elementDescriptor={[descriptors.icon, descriptors.iconInitials]}
   * />
   *
   * // Output: `cl-icon cl-iconInitials`
   * ```
   */
  elementDescriptor?: ElementDescriptor | Array<ElementDescriptor | undefined>;
  /**
   * elementId - An optional property that can be an `ElementId`. This property is used to set a unique identifier for the element.
   *
   * @example
   * ```tsx
   * <Box
   *   elementDescriptor={[descriptors.icon, descriptors.iconInitials]}
   *   elementId={descriptors.icon.setId(id)}
   * />
   *
   * // Output: `cl-icon cl-iconInitials cl-icon__google cl-iconInitials__google`
   * ```
   */
  elementId?: ElementId;
  css?: never;
  sx?: ThemableCssProp;
};

type CustomizablePrimitive<T> = React.FunctionComponent<Customizable<T>>;

type MakeCustomizableOptions = {
  defaultStyles?: ThemableCssProp;
  defaultDescriptor?: ElementDescriptor;
};

function wrapWithStripper(style: ThemableCssProp | undefined, options?: StripOptions): ThemableCssProp | undefined {
  if (!style) return style;
  if (Array.isArray(style)) {
    return style.map(s => wrapWithStripper(s as ThemableCssProp, options)) as ThemableCssProp;
  }
  if (typeof style === 'function') {
    return (theme: InternalTheme) => stripDecorativeStyles(style(theme) as Record<string, any>, options);
  }
  return stripDecorativeStyles(style as Record<string, any>, options);
}

export const makeCustomizable = <P,>(
  Component: React.FunctionComponent<P>,
  options?: MakeCustomizableOptions,
): CustomizablePrimitive<P> => {
  const { defaultStyles, defaultDescriptor } = options || {};

  const customizableComponent = React.forwardRef((props: Customizable<any>, ref) => {
    const { elementDescriptor, elementId, sx, className, ...restProps } = props;
    const { parsedElements, rawMode } = useAppearance();
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
    // In rawMode, strip decorative styles from both defaultStyles and sx.
    // sx is filtered with preserveContentRendering so icon images
    // (backgroundImage/maskImage) survive while borders/colors are removed.
    generatedStyles.css.unshift(
      rawMode ? wrapWithStripper(defaultStyles) : defaultStyles,
      rawMode ? wrapWithStripper(sx, { preserveContentRendering: true }) : sx,
    );

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
