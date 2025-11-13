import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../utils/runtimeEnvironment', () => {
  return {
    isTestEnvironment: vi.fn(() => false),
    isProductionEnvironment: vi.fn(() => false),
  };
});

import type { Mock } from 'vitest';

import { deprecated, deprecatedObjectProperty, deprecatedProperty } from '../deprecated';
import { isProductionEnvironment, isTestEnvironment } from '../utils/runtimeEnvironment';

describe('deprecated(fnName, warning)', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(global.console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test('deprecate class method shows warning', () => {
    class Example {
      getSomeMethod = (arg1?, arg2?) => {
        deprecated('getSomeMethod', 'Use `getSomeMethodElse` instead.');
        return `getSomeMethodValue:${arg1 || '-'}:${arg2 || '-'}`;
      };
    }

    const example = new Example();

    expect(consoleWarnSpy).not.toBeCalled();
    expect(example.getSomeMethod('a', 'b')).toEqual('getSomeMethodValue:a:b');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "getSomeMethod" is deprecated and will be removed in the next major release.\nUse `getSomeMethodElse` instead.',
    );

    expect(example.getSomeMethod()).toEqual('getSomeMethodValue:-:-');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  test('deprecate static method shows warning', () => {
    class Example {
      static getSomeStaticMethod = () => {
        deprecated('getSomeStaticMethod', 'Use `getSomeStaticMethodElse` instead.');
        return 'getSomeStaticMethodValue';
      };
    }

    expect(consoleWarnSpy).not.toBeCalled();
    expect(Example.getSomeStaticMethod()).toEqual('getSomeStaticMethodValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "getSomeStaticMethod" is deprecated and will be removed in the next major release.\nUse `getSomeStaticMethodElse` instead.',
    );

    expect(Example.getSomeStaticMethod()).toEqual('getSomeStaticMethodValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  test('deprecate function shows warning', () => {
    const getSomeFunction = () => {
      deprecated('getSomeFunction', 'Use `getSomeFunctionElse` instead.');
      return 'getSomeFunctionValue';
    };

    expect(consoleWarnSpy).not.toBeCalled();
    expect(getSomeFunction()).toEqual('getSomeFunctionValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "getSomeFunction" is deprecated and will be removed in the next major release.\nUse `getSomeFunctionElse` instead.',
    );

    expect(getSomeFunction()).toEqual('getSomeFunctionValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  test('deprecate function with key shows warning', () => {
    const getSomeFunctionWithKey = () => {
      deprecated('getSomeFunctionWithKey', 'Use `getSomeFunctionWithKeyElse` instead.', 'getSomeFunctionWithKey:key');
      return 'getSomeFunctionWithKeyValue';
    };

    expect(consoleWarnSpy).not.toBeCalled();
    expect(getSomeFunctionWithKey()).toEqual('getSomeFunctionWithKeyValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "getSomeFunctionWithKey" is deprecated and will be removed in the next major release.\nUse `getSomeFunctionWithKeyElse` instead.',
    );

    expect(getSomeFunctionWithKey()).toEqual('getSomeFunctionWithKeyValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  test('deprecate function with the same key does not show warning', () => {
    function V1() {
      const getSomeFunctionWithSameKey = () => {
        deprecated(
          'getSomeFunctionWithSameKey',
          'Use `getSomeFunctionWithSameKeyElse` instead.',
          'getSomeFunctionWithSameKey:key',
        );
        return 'getSomeFunctionWithSameKeyValue';
      };
      return getSomeFunctionWithSameKey;
    }

    function V2() {
      const getSomeFunctionWithSameKey = () => {
        deprecated(
          'getSomeFunctionWithSameKey',
          'Use `getSomeFunctionWithSameKeyElse` instead.',
          'getSomeFunctionWithSameKey:key',
        );
        return 'getSomeFunctionWithSameKeyValue';
      };

      return getSomeFunctionWithSameKey;
    }

    const getSomeFunctionWithSameKeyV1 = V1();
    const getSomeFunctionWithSameKeyV2 = V2();

    expect(consoleWarnSpy).not.toBeCalled();
    expect(getSomeFunctionWithSameKeyV1()).toEqual('getSomeFunctionWithSameKeyValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);

    expect(getSomeFunctionWithSameKeyV1()).toEqual('getSomeFunctionWithSameKeyValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);

    // does not show warning since the consoleWarnSpy counter is 1
    expect(getSomeFunctionWithSameKeyV2()).toEqual('getSomeFunctionWithSameKeyValue');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  describe('for test environment', () => {
    beforeEach(() => {
      (isTestEnvironment as Mock).mockReturnValue(true);
    });
    afterEach(() => {
      (isTestEnvironment as Mock).mockReturnValue(false);
    });

    test('deprecate function does not show warning', () => {
      const getSomeFunctionInProd = () => {
        deprecated('getSomeFunctionInProd', 'Use `getSomeFunctionInProdElse` instead.');
        return 'getSomeFunctionInProdValue';
      };

      expect(consoleWarnSpy).not.toBeCalled();
      // call it twice to verify that it's never called
      expect(getSomeFunctionInProd()).toEqual('getSomeFunctionInProdValue');
      expect(getSomeFunctionInProd()).toEqual('getSomeFunctionInProdValue');
      expect(consoleWarnSpy).toBeCalledTimes(0);
    });
  });

  describe('for production environment', () => {
    beforeEach(() => {
      (isProductionEnvironment as Mock).mockReturnValue(true);
    });
    afterEach(() => {
      (isProductionEnvironment as Mock).mockReturnValue(false);
    });

    test('deprecate function does not show warning', () => {
      const getSomeFunctionInProd = () => {
        deprecated('getSomeFunctionInProd', 'Use `getSomeFunctionInProdElse` instead.');
        return 'getSomeFunctionInProdValue';
      };

      expect(consoleWarnSpy).not.toBeCalled();
      // call it twice to verify that it's never called
      expect(getSomeFunctionInProd()).toEqual('getSomeFunctionInProdValue');
      expect(getSomeFunctionInProd()).toEqual('getSomeFunctionInProdValue');
      expect(consoleWarnSpy).toBeCalledTimes(0);
    });
  });
});

describe('deprecatedProperty(cls, propName, warning, isStatic = false)', () => {
  let consoleWarnSpy = vi.fn();

  beforeEach(() => {
    // @ts-ignore
    consoleWarnSpy = vi.spyOn(global.console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test('deprecate class property shows warning', () => {
    class Example {
      declare someProp: string;
      constructor(someProp: string) {
        this.someProp = someProp;
      }
    }

    deprecatedProperty(Example, 'someProp', 'Use `somePropElse` instead.');

    const example = new Example('someProp-value');

    expect(consoleWarnSpy).not.toBeCalled();
    expect(example.someProp).toEqual('someProp-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "someProp" is deprecated and will be removed in the next major release.\nUse `somePropElse` instead.',
    );

    expect(example.someProp).toEqual('someProp-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  test('deprecate class static property shows warning', () => {
    class Example {
      static someStaticProp: string;
    }

    deprecatedProperty(Example, 'someStaticProp', 'Use `someStaticPropElse` instead.', true);

    Example.someStaticProp = 'someStaticProp-value';
    expect(consoleWarnSpy).not.toBeCalled();

    expect(Example.someStaticProp).toEqual('someStaticProp-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "someStaticProp" is deprecated and will be removed in the next major release.\nUse `someStaticPropElse` instead.',
    );

    expect(Example.someStaticProp).toEqual('someStaticProp-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  test('deprecate class readonly property shows warning', () => {
    class Example {
      declare readonly someReadOnlyProp: string;
      constructor(someReadOnlyProp: string) {
        this.someReadOnlyProp = someReadOnlyProp;
      }
    }

    deprecatedProperty(Example, 'someReadOnlyProp', 'Use `someReadOnlyPropElse` instead.');

    const example = new Example('someReadOnlyProp-value');

    expect(consoleWarnSpy).not.toBeCalled();
    expect(example.someReadOnlyProp).toEqual('someReadOnlyProp-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "someReadOnlyProp" is deprecated and will be removed in the next major release.\nUse `someReadOnlyPropElse` instead.',
    );

    expect(example.someReadOnlyProp).toEqual('someReadOnlyProp-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  describe('for test environment', () => {
    beforeEach(() => {
      (isTestEnvironment as Mock).mockReturnValue(true);
    });
    afterEach(() => {
      (isTestEnvironment as Mock).mockReturnValue(false);
    });

    test('deprecate class readonly property does not show warning', () => {
      class Example {
        declare readonly someReadOnlyPropInProd: string;
        constructor(someReadOnlyPropInProd: string) {
          this.someReadOnlyPropInProd = someReadOnlyPropInProd;
        }
      }

      deprecatedProperty(Example, 'someReadOnlyPropInProd', 'Use `someReadOnlyPropInProdElse` instead.');

      const example = new Example('someReadOnlyPropInProd-value');

      expect(consoleWarnSpy).not.toBeCalled();
      // call it twice to verify that it's never called
      expect(example.someReadOnlyPropInProd).toEqual('someReadOnlyPropInProd-value');
      expect(example.someReadOnlyPropInProd).toEqual('someReadOnlyPropInProd-value');
      expect(consoleWarnSpy).toBeCalledTimes(0);
    });
  });

  describe('for production environment', () => {
    beforeEach(() => {
      (isProductionEnvironment as Mock).mockReturnValue(true);
    });
    afterEach(() => {
      (isProductionEnvironment as Mock).mockReturnValue(false);
    });

    test('deprecate class readonly property does not show warning', () => {
      class Example {
        declare readonly someReadOnlyPropInProd: string;
        constructor(someReadOnlyPropInProd: string) {
          this.someReadOnlyPropInProd = someReadOnlyPropInProd;
        }
      }

      deprecatedProperty(Example, 'someReadOnlyPropInProd', 'Use `someReadOnlyPropInProdElse` instead.');

      const example = new Example('someReadOnlyPropInProd-value');

      expect(consoleWarnSpy).not.toBeCalled();
      // call it twice to verify that it's never called
      expect(example.someReadOnlyPropInProd).toEqual('someReadOnlyPropInProd-value');
      expect(example.someReadOnlyPropInProd).toEqual('someReadOnlyPropInProd-value');
      expect(consoleWarnSpy).toBeCalledTimes(0);
    });
  });
});

describe('deprecatedObjectProperty(obj, propName, warning)', () => {
  let consoleWarnSpy = vi.fn();

  beforeEach(() => {
    // @ts-ignore
    consoleWarnSpy = vi.spyOn(global.console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test('deprecate object property shows warning', () => {
    const example = { objectProperty: 'objectProperty-value' };

    deprecatedObjectProperty(example, 'objectProperty', 'Use `objectPropertyElse` instead.');

    expect(consoleWarnSpy).not.toBeCalled();
    expect(example.objectProperty).toEqual('objectProperty-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
    expect(consoleWarnSpy).toBeCalledWith(
      'Clerk - DEPRECATION WARNING: "objectProperty" is deprecated and will be removed in the next major release.\nUse `objectPropertyElse` instead.',
    );

    expect(example.objectProperty).toEqual('objectProperty-value');
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  describe('for test environment', () => {
    beforeEach(() => {
      (isTestEnvironment as Mock).mockReturnValue(true);
    });
    afterEach(() => {
      (isTestEnvironment as Mock).mockReturnValue(false);
    });

    test('deprecate object property does not show warning', () => {
      const example = { objectPropertyInTest: 'objectPropertyInTest-value' };

      deprecatedObjectProperty(example, 'objectPropertyInTest', 'Use `objectPropertyInTestElse` instead.');

      expect(consoleWarnSpy).not.toBeCalled();
      expect(example.objectPropertyInTest).toEqual('objectPropertyInTest-value');
      // call it twice to verify that it's never called
      expect(example.objectPropertyInTest).toEqual('objectPropertyInTest-value');
      expect(example.objectPropertyInTest).toEqual('objectPropertyInTest-value');
      expect(consoleWarnSpy).toBeCalledTimes(0);
    });
  });

  describe('for production environment', () => {
    beforeEach(() => {
      (isProductionEnvironment as Mock).mockReturnValue(true);
    });
    afterEach(() => {
      (isProductionEnvironment as Mock).mockReturnValue(false);
    });

    test('deprecate object property does not show warning', () => {
      const example = { objectPropertyInProd: 'objectPropertyInProd-value' };

      deprecatedObjectProperty(example, 'objectPropertyInProd', 'Use `objectPropertyInProdElse` instead.');

      expect(consoleWarnSpy).not.toBeCalled();
      expect(example.objectPropertyInProd).toEqual('objectPropertyInProd-value');
      // call it twice to verify that it's never called
      expect(example.objectPropertyInProd).toEqual('objectPropertyInProd-value');
      expect(example.objectPropertyInProd).toEqual('objectPropertyInProd-value');
      expect(consoleWarnSpy).toBeCalledTimes(0);
    });
  });
});
