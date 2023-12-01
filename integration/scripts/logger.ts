/* eslint-disable turbo/no-undeclared-env-vars */
import { default as chalk } from 'chalk';

const getRandomChalkColor = () => {
  const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
  return colors[Math.floor(Math.random() * colors.length)];
};

type CreateLoggerOptions = { prefix: string; color?: string };
export const createLogger = (opts: CreateLoggerOptions) => {
  const { color, prefix } = opts;
  const prefixColor = color || getRandomChalkColor();
  return {
    info: (msg: string) => {
      if (process.env.DEBUG) {
        console.info(`${chalk[prefixColor](`[${prefix}]`)} ${msg}`);
      }
    },
    child: (childOpts: CreateLoggerOptions) => {
      return createLogger({ prefix: `${prefix} :: ${childOpts.prefix}`, color: prefixColor });
    },
  };
};
