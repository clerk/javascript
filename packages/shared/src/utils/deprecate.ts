type AnyFn = (...args: any[]) => any;
type AnyClass = new (...args: any[]) => any;

interface DeprecateType {
  (fnOrPropName: string, warning: string, fnOrMethodOrCls: AnyClass, isStatic?: boolean): void;
  (fnOrPropName: string, warning: string, fnOrMethodOrCls: AnyFn, isStatic?: boolean): AnyFn;
}

/**
 * Mark class properties/methods or functions as deprecated.
 *
 * A console.warn will be displayed on marked ONLY for development
 * environments on the first time it's being accessed or invoked.
 *
 * Examples
 * 1. Deprecate class method
 * class Example {
 *   getSomething = deprecate('getSomething', 'Use `getSomethingElse` instead.', (arg1, arg2) => {
 *       return `getSomethingValue:${arg1 || '-'}:${arg2 || '-'}`;
 *     });
 *   }
 *
 * 2. Deprecate class property
 * class Example {
 *   something: string;
 *   constructor(something: string) {
 *     this.something = something;
 *   }
 * }
 *
 * deprecate('something', 'Use `somethingElse` instead.', Example);
 *
 * 3. Deprecate class static property
 * class Example {
 *   static something: string;
 * }
 *
 * deprecate('something', 'Use `somethingElse` instead.', Example, true);
 *
 * 4. Deprecate function
 * const getSomething = deprecate('getSomething', 'Use `getSomethingElse` instead.', () => {
 *   return 'getSomethingValue';
 * });
 */
export const deprecate: DeprecateType = (fnOrPropName, warning, fnOrMethodOrCls, isStatic = false) => {
  let wasWarned = false;

  const warn = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isDevelopment) {
      return;
    }

    if (!wasWarned) {
      console.warn(`${fnOrPropName} will be deprecated in the next major release.\n${warning}`);
      wasWarned = true;
    }
  };

  if (isClass(fnOrMethodOrCls)) {
    const target = isStatic ? fnOrMethodOrCls : fnOrMethodOrCls.prototype;
    return deprecateProperty(fnOrPropName, warn, target);
  }

  return (...args) => {
    warn();
    // TODO: omit ts-ignore by resolving type issue with this
    // @ts-ignore
    return fnOrMethodOrCls.apply(this, args);
  };
};

const deprecateProperty = <Τ extends AnyClass>(fnOrPropName: string, warn: AnyFn, target: Τ): Τ => {
  Object.defineProperty(target, fnOrPropName, {
    get() {
      warn();
      return this['_' + fnOrPropName];
    },
    set(v: any) {
      this['_' + fnOrPropName] = v;
    },
  });

  return target;
};

function isClass(fnOrCls: AnyFn | AnyClass): fnOrCls is AnyClass {
  return fnOrCls.toString().startsWith('class');
}
