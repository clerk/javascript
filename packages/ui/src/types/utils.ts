// https://github.com/sindresorhus/type-fest/blob/main/source/require-exactly-one.d.ts
export type RequireExactlyOne<ObjectType, KeysType extends keyof ObjectType = keyof ObjectType> = {
  [Key in KeysType]: Required<Pick<ObjectType, Key>> & Partial<Record<Exclude<KeysType, Key>, never>>;
}[KeysType] &
  Omit<ObjectType, KeysType>;

export type VerificationStatus =
  | 'expired'
  | 'failed'
  | 'loading'
  | 'verified'
  | 'verified_switch_tab'
  | 'client_mismatch';

/**
 * Zero-runtime polymorphic component definitions for React
 *
 * @link https://github.com/kripod/react-polymorphic-types
 */
type Merge<T, U> = Omit<T, keyof U> & U;

type PropsWithAs<P, T extends React.ElementType> = P & { as?: T };

export type PolymorphicPropsWithoutRef<P, T extends React.ElementType> = Merge<
  T extends keyof JSX.IntrinsicElements
    ? React.PropsWithoutRef<JSX.IntrinsicElements[T]>
    : React.ComponentPropsWithoutRef<T>,
  PropsWithAs<P, T>
>;

export type PolymorphicPropsWithRef<P, T extends React.ElementType> = Merge<
  T extends keyof JSX.IntrinsicElements ? React.PropsWithRef<JSX.IntrinsicElements[T]> : React.ComponentPropsWithRef<T>,
  PropsWithAs<P, T>
>;

type PolymorphicExoticComponent<P = object, T extends React.ElementType = React.ElementType> = Merge<
  React.ExoticComponent<P & { [key: string]: unknown }>,
  {
    /**
     * **NOTE**: Exotic components are not callable.
     */
    <InstanceT extends React.ElementType = T>(
      props: PolymorphicPropsWithRef<P, InstanceT>,
    ): ReturnType<React.FunctionComponent>;
  }
>;

export type PolymorphicForwardRefExoticComponent<P, T extends React.ElementType> = Merge<
  React.ForwardRefExoticComponent<P & { [key: string]: unknown }>,
  PolymorphicExoticComponent<P, T>
>;

export type PolymorphicMemoExoticComponent<P, T extends React.ElementType> = Merge<
  React.MemoExoticComponent<React.ComponentType<any>>,
  PolymorphicExoticComponent<P, T>
>;

export type PolymorphicLazyExoticComponent<P, T extends React.ElementType> = Merge<
  React.LazyExoticComponent<React.ComponentType<any>>,
  PolymorphicExoticComponent<P, T>
>;
