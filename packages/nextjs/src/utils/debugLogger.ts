// TODO: Replace with a more sophisticated logging solution

import truncate from 'truncate-utf8-bytes';

import { logFormatter } from './logFormatter';

export type Log = string | Record<string, unknown>;
export type LogEntry = Log | Log[];
export type Logger<L = Log> = {
  commit: () => void;
  debug: (...args: Array<L | (() => L)>) => void;
  enable: () => void;
};

export const createDebugLogger = (name: string, formatter: (val: LogEntry) => string) => (): Logger => {
  const entries: LogEntry[] = [];
  let isEnabled = false;

  return {
    enable: () => {
      isEnabled = true;
    },
    debug: (...args) => {
      if (isEnabled) {
        entries.push(args.map(arg => (typeof arg === 'function' ? arg() : arg)));
      }
    },
    commit: () => {
      if (isEnabled) {
        const log = `Clerk debug start :: ${name}\n${entries
          .map(log => formatter(log))
          .map(e => `-- ${e}\n`)
          .join('')}`;
        if (process.env.VERCEL) {
          console.log(truncate(log, 4096));
        } else {
          console.log(log);
        }
      }
    },
  };
};

type WithLogger = <L extends Logger, H extends (...args: any[]) => any>(
  loggerFactoryOrName: string | (() => L),
  handlerCtor: (logger: Omit<L, 'commit'>) => H,
) => H;

export const withLogger: WithLogger = (loggerFactoryOrName, handlerCtor) => {
  return ((...args: any) => {
    const factory =
      typeof loggerFactoryOrName === 'string'
        ? createDebugLogger(loggerFactoryOrName, logFormatter)
        : loggerFactoryOrName;

    const logger = factory();
    const handler = handlerCtor(logger as any);

    try {
      const res = handler(...args);
      if (typeof res === 'object' && 'then' in res && typeof res.then === 'function') {
        return res
          .then((val: any) => {
            logger.commit();
            return val;
          })
          .catch((err: any) => {
            logger.commit();
            throw err;
          });
      }
      // handle sync methods
      logger.commit();
      return res;
    } catch (err: any) {
      logger.commit();
      throw err;
    }
  }) as ReturnType<typeof handlerCtor>;
};
