import { expectTypeOf } from 'expect-type';

import { withLogger } from './debugLogger';

describe('withLogger', () => {
  let logger: any;

  beforeEach(() => {
    logger = {
      enable: jest.fn(),
      log: jest.fn(),
      commit: jest.fn(),
    };
  });

  it('should return the type of the passed handler', function () {
    type Options = { name: string; test: number };
    const handler = withLogger(
      () => logger,
      logger => (opts: Options) => {
        logger.commit();
        return opts.name;
      },
    );

    expectTypeOf(handler).toMatchTypeOf<(opts: Options) => string>();
  });

  it('should log upon return of a sync function', function () {
    const handler = withLogger(
      () => logger,
      logger => () => {
        logger.enable();
        logger.log('test');
        return 'test';
      },
    );
    expect(logger.enable).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.commit).not.toHaveBeenCalled();
    handler();
    expect(logger.enable).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalled();
    expect(logger.commit).toHaveBeenCalled();
  });

  it('should log before an error is thrown inside of a sync function', function () {
    const handler = withLogger(
      () => logger,
      logger => () => {
        logger.enable();
        logger.log('test');
        throw new Error();
      },
    );
    expect(logger.enable).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.commit).not.toHaveBeenCalled();
    try {
      handler();
    } catch (e) {
      expect(e).toBeDefined();
      expect(logger.enable).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalled();
      expect(logger.commit).toHaveBeenCalled();
    }
  });

  it('should log upon return of a async function', async function () {
    const handler = withLogger(
      () => logger,
      logger => async () => {
        logger.enable();
        logger.log('test');
        const res = await new Promise(resolve => {
          resolve('test');
        });
        return res;
      },
    );
    expect(logger.enable).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.commit).not.toHaveBeenCalled();
    await handler();
    expect(logger.enable).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalled();
    expect(logger.commit).toHaveBeenCalled();
  });

  it('should log before an error is thrown inside of an async function', async function () {
    const handler = withLogger(
      () => logger,
      logger => async () => {
        logger.enable();
        logger.log('test');
        const res = await new Promise((_, reject) => {
          reject(new Error());
        });
        return res;
      },
    );
    expect(logger.enable).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.commit).not.toHaveBeenCalled();
    try {
      await handler();
    } catch (e) {
      expect(e).toBeDefined();
      expect(logger.enable).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalled();
      expect(logger.commit).toHaveBeenCalled();
    }
  });

  it('should truncate bytes to 4096 when deploying on vercel', () => {
    // setup: mock vercel environment, mock console log so we can intercept its value
    process.env.VERCEL = 'true';
    const oldConsoleLog = console.log.bind(console);
    const log = jest.fn();
    console.log = log;

    const veryLongString = new Array(6000).join('a');
    const handler = withLogger('test-logger', logger => () => {
      logger.enable();
      logger.debug(veryLongString);
      logger.debug(veryLongString);
    });
    handler();

    for (const mockCall of log.mock.calls) {
      expect(mockCall[0].length).toBeLessThanOrEqual(4096);
    }

    // restore original console log and reset environment value
    process.env.VERCEL = undefined;
    console.log = oldConsoleLog;
  });
});
