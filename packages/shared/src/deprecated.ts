import { isProductionEnvironment, isTestEnvironment } from './utils/runtimeEnvironment';
/**
 * Mark class method / function as deprecated.
 *
 * A console WARNING will be displayed when class method / function is invoked.
 *
 * Examples
 * 1. Deprecate class method
 * class Example {
 *   getSomething = (arg1, arg2) => {
 *       deprecated('Example.getSomething', 'Use `getSomethingElse` instead.');
 *       return `getSomethingValue:${arg1 || '-'}:${arg2 || '-'}`;
 *   };
 * }
 *
 * 2. Deprecate function
 * const getSomething = () => {
 *   deprecated('getSomething', 'Use `getSomethingElse` instead.');
 *   return 'getSomethingValue';
 * };
 */
const displayedWarnings = new Set<string>();
export const deprecated = (fnName: string, warning: string, key?: string): void => {
  const hideWarning = isTestEnvironment() || isProductionEnvironment();
  const messageId = key ?? fnName;
  if (displayedWarnings.has(messageId) || hideWarning) {
    return;
  }
  displayedWarnings.add(messageId);

  console.warn(
    `Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.\n${warning}`,
  );
};
/**
 * Mark class property as deprecated.
 *
 * A console WARNING will be displayed when class property is being accessed.
 *
 * 1. Deprecate class property
 * class Example {
 *   something: string;
 *   constructor(something: string) {
 *     this.something = something;
 *   }
 * }
 *
 * deprecatedProperty(Example, 'something', 'Use `somethingElse` instead.');
 *
 * 2. Deprecate class static property
 * class Example {
 *   static something: string;
 * }
 *
 * deprecatedProperty(Example, 'something', 'Use `somethingElse` instead.', true);
 */
type AnyClass = new (...args: any[]) => any;

export const deprecatedProperty = (cls: AnyClass, propName: string, warning: string, isStatic = false): void => {
  const target = isStatic ? cls : cls.prototype;

  let value = target[propName];
  Object.defineProperty(target, propName, {
    get() {
      deprecated(propName, warning, `${cls.name}:${propName}`);
      return value;
    },
    set(v: unknown) {
      value = v;
    },
  });
};

/**
 * Mark object property as deprecated.
 *
 * A console WARNING will be displayed when object property is being accessed.
 *
 * 1. Deprecate object property
 * const obj = { something: 'aloha' };
 *
 * deprecatedObjectProperty(obj, 'something', 'Use `somethingElse` instead.');
 */
export const deprecatedObjectProperty = (
  obj: Record<string, any>,
  propName: string,
  warning: string,
  key?: string,
): void => {
  let value = obj[propName];
  Object.defineProperty(obj, propName, {
    get() {
      deprecated(propName, warning, key);
      return value;
    },
    set(v: unknown) {
      value = v;
    },
  });
};
