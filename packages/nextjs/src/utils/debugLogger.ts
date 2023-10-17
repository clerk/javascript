// TODO: Replace with a more sophisticated logging solution

import nextPkg from 'next/package.json';

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
        console.log(debugLogHeader(name));

        /**
         * We buffer each collected log entry so we can format them and log them all at once.
         * Individual console.log calls are used to ensure we don't hit platform-specific log limits (Vercel and Netlify are 4kb).
         */
        for (const log of entries) {
          let output = formatter(log);

          output = output
            .split('\n')
            .map(l => `  ${l}`)
            .join('\n');

          // Vercel errors if the output is > 4kb, so we truncate it
          if (process.env.VERCEL) {
            output = truncate(output, 4096);
          }

          console.log(output);
        }

        console.log(debugLogFooter(name));
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

function debugLogHeader(name: string) {
  return `[clerk debug start: ${name}]`;
}

function debugLogFooter(name: string) {
  return `[clerk debug end: ${name}] (@clerk/nextjs=${PACKAGE_VERSION},next=${nextPkg.version})`;
}

// ref: https://stackoverflow.com/questions/57769465/javascript-truncate-text-by-bytes-length
function truncate(str: string, maxLength: number) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');

  const encodedString = encoder.encode(str);
  const truncatedString = encodedString.slice(0, maxLength);

  // return the truncated string, removing any replacement characters that result from partially truncated characters
  return decoder.decode(truncatedString).replace(/\uFFFD/g, '');
}
