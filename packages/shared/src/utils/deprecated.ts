import { isProductionEnvironment, isTestEnvironment } from './runtimeEnvironment';
/**
 * Mark class methods or functions as deprecated.
 *
 * A console WARNING will be displayed when class methods
 * or functions are invoked.
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
    `DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.\n${warning}`,
  );
};
/**
 * Mark class properties as deprecated.
 *
 * A console WARNING will be displayed when class properties are being accessed.
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

  Object.defineProperty(target, propName, {
    get() {
      deprecated(propName, warning, `${cls.name}:${propName}`);
      return this['_' + propName];
    },
    set(v: unknown) {
      this['_' + propName] = v;
    },
  });
};
