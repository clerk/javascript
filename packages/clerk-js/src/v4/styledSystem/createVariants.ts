import { applyCustomCssUtilities } from './customCssUtilities';
import { StyleRuleWithCustomCssUtils, Theme } from './types';

type UnwrapBooleanVariant<T> = T extends 'true' | 'false' ? boolean : T;

type VariantDefinition = Record<string, StyleRuleWithCustomCssUtils>;

type Variants = Record<string, VariantDefinition>;

type VariantNameToKeyMap<V> = {
  [key in keyof V]?: UnwrapBooleanVariant<keyof V[key]>;
};

type DefaultVariants<V> = VariantNameToKeyMap<V>;

type CompoundVariant<V> = {
  condition: VariantNameToKeyMap<V>;
  styles?: StyleRuleWithCustomCssUtils;
};

type CreateVariantsConfig<V> = {
  base?: StyleRuleWithCustomCssUtils;
  variants?: V;
  compoundVariants?: Array<CompoundVariant<V>>;
  defaultVariants?: DefaultVariants<V>;
};

interface ApplyVariants<T, V> {
  (props?: VariantNameToKeyMap<V>): (theme: T) => StyleRuleWithCustomCssUtils;
}

export type StyleVariants<T extends () => any> = Parameters<T>[0];

type CreateVariantsReturn<T, V extends Variants> = {
  applyVariants: ApplyVariants<T, V>;
  filterProps: <Props>(props: Props) => {
    [k in Exclude<keyof Props, keyof V>]: Props[k];
  };
};

interface CreateVariants {
  <T = Theme, V extends Variants = Variants>(param: (theme: T) => CreateVariantsConfig<V>): CreateVariantsReturn<T, V>;
}

export const createVariants: CreateVariants = configFn => {
  const applyVariants =
    (props: any = {}) =>
    (theme: any) => {
      const { base, variants = {}, compoundVariants = [], defaultVariants = {} } = configFn(theme);
      const variantsToApply = calculateVariantsToBeApplied(variants, props, defaultVariants);
      const computedStyles = {};
      applyBaseRules(computedStyles, base);
      applyVariantRules(computedStyles, variantsToApply, variants);
      applyCompoundVariantRules(computedStyles, variantsToApply, compoundVariants);
      applyCustomCssUtilities(computedStyles);
      return computedStyles;
    };

  // We need to get the variant keys in order to remove them from the props.
  // However, we don't have access to the theme value when createVariants is called.
  // Instead of the theme, we pass an infinite proxy because we only care about
  // the keys of the returned object and not the actual values.
  const fakeProxyTheme = createInfiniteAccessProxy();
  const variantKeys = Object.keys(configFn(fakeProxyTheme).variants || {});
  const filterProps = (props: any) => getPropsWithoutVariants(props, variantKeys);
  return { applyVariants, filterProps } as any;
};

const getPropsWithoutVariants = (props: Record<string, any>, variants: string[]) => {
  const res = { ...props };
  for (const key of variants) {
    delete res[key];
  }
  return res;
};

const applyBaseRules = (computedStyles: any, base?: StyleRuleWithCustomCssUtils) => {
  if (base && typeof base === 'object') {
    Object.assign(computedStyles, base);
  }
};

const applyVariantRules = (computedStyles: any, variantsToApply: Variants, variants: Variants) => {
  for (const key in variantsToApply) {
    // @ts-ignore
    Object.assign(computedStyles, variants[key][variantsToApply[key]]);
  }
};

const applyCompoundVariantRules = (
  computedStyles: any,
  variantsToApply: Variants,
  compoundVariants: Array<CompoundVariant<any>>,
) => {
  for (const compoundVariant of compoundVariants) {
    if (conditionMatches(compoundVariant, variantsToApply)) {
      Object.assign(computedStyles, compoundVariant.styles);
    }
  }
};

const calculateVariantsToBeApplied = (
  variants: Variants,
  props: Record<string, any>,
  defaultVariants: DefaultVariants<any>,
) => {
  const variantsToApply = {};
  for (const key in variants) {
    if (key in props) {
      // @ts-ignore
      variantsToApply[key] = props[key];
    } else if (key in defaultVariants) {
      // @ts-ignore
      variantsToApply[key] = defaultVariants[key as keyof typeof defaultVariants];
    }
  }
  return variantsToApply;
};

const conditionMatches = ({ condition }: CompoundVariant<any>, variants: Variants) => {
  for (const key in condition) {
    // @ts-ignore
    if (condition[key] !== variants[key]) {
      return false;
    }
  }
  return true;
};

const createInfiniteAccessProxy = () => {
  const proxy: any = new Proxy({}, { get: () => proxy });
  return proxy;
};
