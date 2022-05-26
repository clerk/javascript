import { useContainerMetadata } from '../elements/hooks';

type Customizable<T = {}> = { appearanceKey?: string | string[] } & T;
type CustomizablePrimitive<T> = React.FunctionComponent<Customizable<T>>;

const fakeGenerateSemanticClassName = (props: any) => {
  const { appearanceKey, pageMetadata: any } = props;
  const [first, ...rest] = typeof appearanceKey === 'string' ? [appearanceKey] : appearanceKey;
  return ['cl', first, rest.map((a: any) => a).join('')].filter(s => s).join('-');
};

export const makeCustomizable = <P,>(Component: React.FunctionComponent<P>): CustomizablePrimitive<P> => {
  const CustomizableComponent = (props: Customizable<P>) => {
    const { appearanceKey, ...restProps } = props;
    const pageMetadata = useContainerMetadata();
    const appearance = {} as any; // useAppearance();
    if (!appearanceKey) {
      return <Component {...(restProps as any)} />;
    }
    const className = fakeGenerateSemanticClassName({ appearanceKey, pageMetadata, appearance });
    return <Component {...({ ...restProps, className: className + ' 🔒' } as any)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  CustomizableComponent.displayName = `Customizable${displayName}`.replace('_', '');
  return CustomizableComponent as CustomizablePrimitive<P>;
};
