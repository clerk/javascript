/**
 * Copyright 2022 Joe Bell. All rights reserved.
 *
 * This file is licensed to you under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR REPRESENTATIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
import { clsx } from 'clsx';

import { type DescriptorIdentifier, mergeDescriptors, type ParsedElements } from '~/contexts/AppearanceContext';

/* Types
  ============================================ */

/* clsx
  ---------------------------------- */

// When compiling with `declaration: true`, many projects experience the dreaded
// TS2742 error. To combat this, we copy clsx's types manually.
// Should this project move to JSDoc, this workaround would no longer be needed.

type ClassValue = ClassArray | ClassDictionary | DescriptorIdentifier | number | null | boolean | undefined;
type ClassDictionary = Record<DescriptorIdentifier, any>;
type ClassArray = ClassValue[];

/* Utils
  ---------------------------------- */

type OmitUndefined<T> = T extends undefined ? never : T;
type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  'class' | 'className'
>;

/* compose
  ---------------------------------- */

export interface Compose {
  <T extends ReturnType<DVA>[]>(
    ...components: [...T]
  ): (
    props?: (
      | UnionToIntersection<
          {
            [K in keyof T]: VariantProps<T[K]>;
          }[number]
        >
      | undefined
    ) &
      DVAClassProp,
  ) => string;
}

/* cx
  ---------------------------------- */

export interface CX {
  (...inputs: ClassValue[]): string;
}

export type CXOptions = Parameters<CX>;
export type CXReturn = ReturnType<CX>;

/* dva
  ============================================ */

type DVAConfigBase = { base?: ClassValue };
type DVAVariantShape = Record<string, Record<string, ClassValue>>;
type DVAVariantSchema<V extends DVAVariantShape> = {
  [Variant in keyof V]?: StringToBoolean<keyof V[Variant]> | undefined;
};
type DVAClassProp = { descriptor?: ClassValue };

export interface DVA {
  <_ extends "dva's generic parameters are restricted to internal use only.", V>(
    config: V extends DVAVariantShape
      ? DVAConfigBase & {
          variants?: V;
          compoundVariants?: (V extends DVAVariantShape
            ? (
                | DVAVariantSchema<V>
                | {
                    [Variant in keyof V]?:
                      | StringToBoolean<keyof V[Variant]>
                      | StringToBoolean<keyof V[Variant]>[]
                      | undefined;
                  }
              ) &
                DVAClassProp
            : DVAClassProp)[];
          defaultVariants?: DVAVariantSchema<V>;
        }
      : DVAConfigBase & {
          variants?: never;
          compoundVariants?: never;
          defaultVariants?: never;
        },
  ): (props?: V extends DVAVariantShape ? DVAVariantSchema<V> & DVAClassProp : DVAClassProp) => string;
}

/* defineConfig
  ---------------------------------- */

export interface DefineConfigOptions {
  hooks?: {
    /**
     * @deprecated please use `onComplete`
     */
    'cx:done'?: (className: string) => string;
    /**
     * Returns the completed string of concatenated classes/classNames.
     */
    onComplete?: (className: string) => string;
  };
}

export interface DefineConfig {
  (options?: DefineConfigOptions): {
    compose: Compose;
    cx: CX;
    dva: DVA;
  };
}

/* Exports
  ============================================ */

const falsyToString = <T, _>(value: T) => (typeof value === 'boolean' ? `${value}` : value === 0 ? '0' : value);

export const defineConfig: DefineConfig = options => {
  const cx: CX = (...inputs) => {
    if (typeof options?.hooks?.['cx:done'] !== 'undefined') {
      return options?.hooks['cx:done'](clsx(inputs));
    }

    if (typeof options?.hooks?.onComplete !== 'undefined') {
      return options?.hooks.onComplete(clsx(inputs));
    }

    return clsx(inputs);
  };

  const dva: DVA = config => props => {
    if (config?.variants == null) {
      return cx(config?.base, props?.descriptor);
    }

    const { variants, defaultVariants } = config;

    const getVariantClassNames = Object.keys(variants).map((variant: keyof typeof variants) => {
      const variantProp = props?.[variant as keyof typeof props];
      const defaultVariantProp = defaultVariants?.[variant];

      const variantKey = (falsyToString(variantProp) ||
        falsyToString(defaultVariantProp)) as keyof (typeof variants)[typeof variant];

      return variants[variant][variantKey];
    });

    const defaultsAndProps = {
      ...defaultVariants,
      // remove `undefined` props
      ...(props &&
        Object.entries(props).reduce<typeof props>(
          (acc, [key, value]) => (typeof value === 'undefined' ? acc : { ...acc, [key]: value }),
          {} as typeof props,
        )),
    };

    const getCompoundVariantClassNames = config?.compoundVariants?.reduce(
      (acc, { descriptor, ...cvConfig }) =>
        Object.entries(cvConfig).every(([cvKey, cvSelector]) => {
          const selector = defaultsAndProps[cvKey as keyof typeof defaultsAndProps];

          return Array.isArray(cvSelector) ? cvSelector.includes(selector) : selector === cvSelector;
        })
          ? [...acc, descriptor]
          : acc,
      [] as ClassValue[],
    );

    return cx(config?.base, getVariantClassNames, getCompoundVariantClassNames, props?.descriptor);
  };

  const compose: Compose =
    (...components) =>
    props => {
      const propsWithoutDescriptor = Object.fromEntries(
        Object.entries(props || {}).filter(([key]) => !['descriptor'].includes(key)),
      );

      return cx(components.map(component => component(propsWithoutDescriptor)) as ClassValue[], props?.descriptor);
    };

  return {
    compose,
    dva,
    cx,
  };
};

export const { compose, dva, cx } = defineConfig();

export function getDescriptors(elements: ParsedElements, descriptorList: string) {
  const descriptors = descriptorList.split(' ') as (keyof ParsedElements)[];
  return descriptors.map(d => elements[d]);
}

export function applyDescriptors(elements: ParsedElements, descriptorList: string) {
  const descriptors = getDescriptors(elements, descriptorList);
  return mergeDescriptors(...descriptors);
}
