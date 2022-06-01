import { useFlowMetadata } from '../elements/contexts';
import { ThemableCssProp } from '../styledSystem';
import { useAppearance } from './AppearanceContext';
import { generateClassName } from './classGeneration';
import { ElementDescriptor, ElementId } from './elementDescriptors';

type Customizable<T = {}> = T & {
  elementDescriptor?: ElementDescriptor;
  elementId?: ElementId;
  css?: never;
  weakCss?: ThemableCssProp;
};

type CustomizablePrimitive<T> = React.FunctionComponent<Customizable<T>>;

export const makeCustomizable = <P,>(Component: React.FunctionComponent<P>): CustomizablePrimitive<P> => {
  const customizableComponent = (props: Customizable<any>) => {
    const { elementDescriptor, elementId, weakCss, className, ...restProps } = props;
    const flowMetadata = useFlowMetadata();
    const { parsedElements } = useAppearance();

    if (!elementDescriptor) {
      return (
        <Component
          {...restProps}
          className={className}
        />
      );
    }

    const generatedStyles = generateClassName(parsedElements, elementDescriptor, elementId, props, flowMetadata);
    const generatedClassname = generatedStyles.className + (className ? ' ' + (className as string) : '');
    generatedStyles.css.unshift(weakCss);

    return (
      <Component
        css={generatedStyles.css}
        // always first for better readability in the DOM
        className={generatedClassname}
        {...restProps}
      />
    );
  };

  const displayName = Component.displayName || Component.name || 'Component';
  customizableComponent.displayName = `Customizable${displayName}`.replace('_', '');
  return customizableComponent as CustomizablePrimitive<P>;
};
