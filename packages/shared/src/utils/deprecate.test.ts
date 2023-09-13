import { deprecate } from './deprecate';

describe('deprecate(fnOrPropName, warning, fnOrMethodOrCls, isStatic)', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(global.console, 'warn').mockImplementation();
  });
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('on development environment', () => {
    const currentNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = currentNodeEnv;
    });

    test('deprecate class method shows warning', () => {
      class Example {
        getSomething = deprecate('getSomething', 'Use `getSomethingElse` instead.', (arg1?, arg2?) => {
          return `getSomethingValue:${arg1 || '-'}:${arg2 || '-'}`;
        });
      }

      const example = new Example();

      expect(consoleWarnSpy).not.toBeCalled();
      expect(example.getSomething('a', 'b')).toEqual('getSomethingValue:a:b');
      expect(consoleWarnSpy).toBeCalledTimes(1);
      expect(consoleWarnSpy).toBeCalledWith(
        'getSomething will be deprecated in the next major release.\nUse `getSomethingElse` instead.',
      );

      expect(example.getSomething()).toEqual('getSomethingValue:-:-');
      expect(consoleWarnSpy).toBeCalledTimes(1);
    });

    test('deprecate static method shows warning', () => {
      class Example {
        static getSomething = deprecate('getSomething', 'Use `getSomethingElse` instead.', () => {
          return 'getSomethingValue';
        });
      }

      expect(consoleWarnSpy).not.toBeCalled();
      expect(Example.getSomething()).toEqual('getSomethingValue');
      expect(consoleWarnSpy).toBeCalledTimes(1);
      expect(consoleWarnSpy).toBeCalledWith(
        'getSomething will be deprecated in the next major release.\nUse `getSomethingElse` instead.',
      );

      expect(Example.getSomething()).toEqual('getSomethingValue');
      expect(consoleWarnSpy).toBeCalledTimes(1);
    });

    test('deprecate function shows warning', () => {
      const getSomething = deprecate('getSomething', 'Use `getSomethingElse` instead.', () => {
        return 'getSomethingValue';
      });

      expect(consoleWarnSpy).not.toBeCalled();
      expect(getSomething()).toEqual('getSomethingValue');
      expect(consoleWarnSpy).toBeCalledTimes(1);
      expect(consoleWarnSpy).toBeCalledWith(
        'getSomething will be deprecated in the next major release.\nUse `getSomethingElse` instead.',
      );

      expect(getSomething()).toEqual('getSomethingValue');
      expect(consoleWarnSpy).toBeCalledTimes(1);
    });

    test('deprecate class property shows warning', () => {
      class Example {
        something: string;
        constructor(something: string) {
          this.something = something;
        }
      }

      deprecate('something', 'Use `somethingElse` instead.', Example);

      const example = new Example('some-value');

      expect(consoleWarnSpy).not.toBeCalled();
      expect(example.something).toEqual('some-value');
      expect(consoleWarnSpy).toBeCalledTimes(1);
      expect(consoleWarnSpy).toBeCalledWith(
        'something will be deprecated in the next major release.\nUse `somethingElse` instead.',
      );

      expect(example.something).toEqual('some-value');
      expect(consoleWarnSpy).toBeCalledTimes(1);
    });

    test('deprecate class static property shows warning', () => {
      class Example {
        static something: string;
      }

      deprecate('something', 'Use `somethingElse` instead.', Example, true);

      Example.something = 'some-value';
      expect(consoleWarnSpy).not.toBeCalled();

      expect(Example.something).toEqual('some-value');
      expect(consoleWarnSpy).toBeCalledTimes(1);
      expect(consoleWarnSpy).toBeCalledWith(
        'something will be deprecated in the next major release.\nUse `somethingElse` instead.',
      );

      expect(Example.something).toEqual('some-value');
      expect(consoleWarnSpy).toBeCalledTimes(1);
    });

    test('deprecate class readonly property shows warning', () => {
      class Example {
        readonly something: string;
        constructor(something: string) {
          this.something = something;
        }
      }

      deprecate('something', 'Use `somethingElse` instead.', Example);

      const example = new Example('some-value');

      expect(consoleWarnSpy).not.toBeCalled();
      expect(example.something).toEqual('some-value');
      expect(consoleWarnSpy).toBeCalledTimes(1);
      expect(consoleWarnSpy).toBeCalledWith(
        'something will be deprecated in the next major release.\nUse `somethingElse` instead.',
      );

      expect(example.something).toEqual('some-value');
      expect(consoleWarnSpy).toBeCalledTimes(1);
    });
  });

  describe('on production environment', () => {
    const currentNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = currentNodeEnv;
    });

    test('deprecate class method does NOT show warning', () => {
      class Example {
        getSomething = deprecate('getSomething', 'Use `getSomethingElse` instead.', (arg1?, arg2?) => {
          return `getSomethingValue:${arg1 || '-'}:${arg2 || '-'}`;
        });
      }

      const example = new Example();

      expect(consoleWarnSpy).not.toBeCalled();
      expect(example.getSomething('a', 'b')).toEqual('getSomethingValue:a:b');
      expect(consoleWarnSpy).not.toBeCalled();

      expect(example.getSomething()).toEqual('getSomethingValue:-:-');
      expect(consoleWarnSpy).not.toBeCalled();
    });

    test('deprecate class property shows warning does NOT show warning', () => {
      class Example {
        something: string;
        constructor(something: string) {
          this.something = something;
        }
      }

      deprecate('something', 'Use `somethingElse` instead.', Example);

      const example = new Example('some-value');

      expect(consoleWarnSpy).not.toBeCalled();
      expect(example.something).toEqual('some-value');
      expect(consoleWarnSpy).not.toBeCalled();

      expect(example.something).toEqual('some-value');
      expect(consoleWarnSpy).not.toBeCalled();
    });
  });
});
