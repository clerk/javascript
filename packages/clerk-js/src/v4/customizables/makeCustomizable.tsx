import { useFlowMetadata } from '../elements/contexts';
import { ThemableCssProp } from '../styledSystem';
import { useAppearance } from './AppearanceProvider';
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
  const customizableComponent = (props: Customizable<P>) => {
    const { elementDescriptor, elementId, weakCss, ...restProps } = props;
    const flowMetadata = useFlowMetadata();
    const { parsedAppearance } = useAppearance();

    if (!elementDescriptor) {
      return <Component {...(restProps as any)} />;
    }

    const { className, css } = generateClassName(parsedAppearance, elementDescriptor, elementId, props, flowMetadata);
    const generatedClassname = ((restProps as any).className ? (restProps as any).className + ' ' : '') + className;
    css.unshift(weakCss);

    return (
      <Component
        css={css}
        {...(restProps as any)}
        className={generatedClassname}
      />
    );
  };

  const displayName = Component.displayName || Component.name || 'Component';
  customizableComponent.displayName = `Customizable${displayName}`.replace('_', '');
  return customizableComponent as CustomizablePrimitive<P>;
};
