// TODO: Replace with a more sophisticated logging solution

type Log = string | Record<string, unknown>;
type Logger<L = Log> = {
  commit: () => void;
  debug: (...args: Array<L | (() => L)>) => void;
  enable: () => void;
};

export const createDebugLogger = (name: string) => (): Logger => {
  type LogEntry = Log | Log[];
  const entries: LogEntry[] = [];
  let isEnabled = false;

  const logEntry = (entry: LogEntry) => {
    return (Array.isArray(entry) ? entry : [entry]).map(e => JSON.stringify(e)).join(', ');
  };

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
        console.log(
          `Clerk debug start :: ${name}\n${entries
            .map(logEntry)
            .map(e => `-- ${e}\n`)
            .join('')}`,
        );
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
      typeof loggerFactoryOrName === 'string' ? createDebugLogger(loggerFactoryOrName) : loggerFactoryOrName;
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
