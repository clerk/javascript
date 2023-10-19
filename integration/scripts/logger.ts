/* eslint-disable turbo/no-undeclared-env-vars */
import { default as chalk } from 'chalk';

const getRandomChalkBgColor = () => {
  const colors = ['bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite'];
  return colors[Math.floor(Math.random() * colors.length)];
};

type CreateLoggerOptions = { prefix: string; color?: string };
export const createLogger = (opts: CreateLoggerOptions) => {
  const { color, prefix } = opts;
  const prefixBgColor = color || getRandomChalkBgColor();
  return {
    info: (msg: string) => {
      if (process.env.DEBUG) {
        console.info(`${chalk[prefixBgColor](`[${prefix}]`)} ${msg}`);
      }
    },
    child: (childOpts: CreateLoggerOptions) => {
      return createLogger({ prefix: `${prefix} :: ${childOpts.prefix}`, color: prefixBgColor });
    },
  };
};
