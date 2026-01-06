/* eslint-disable turbo/no-undeclared-env-vars */
import { default as chalk } from 'chalk';

const getRandomChalkColor = () => {
  const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

type CreateLoggerOptions = { prefix: string; color?: string };
export const createLogger = (opts: CreateLoggerOptions) => {
  const { color, prefix } = opts;
  const prefixColor = color || getRandomChalkColor();
  return {
    info: (msg: string) => {
      if (
        process.env.E2E_DEBUG === 'true' ||
        process.env.E2E_DEBUG === '1' ||
        process.env.ACTIONS_STEP_DEBUG ||
        process.env.ACTIONS_RUNNER_DEBUG
      ) {
        console.info(`${chalk[prefixColor](`[${prefix}]`)} ${msg}`);
      }
    },
    warn: (msg: string, error?: unknown) => {
      const errorMsg = error instanceof Error ? error.message : String(error ?? '');
      const fullMsg = errorMsg ? `${msg} ${errorMsg}` : msg;
      console.warn(`${chalk.yellow(`[${prefix}]`)} ${fullMsg}`);
    },
    child: (childOpts: CreateLoggerOptions) => {
      return createLogger({ prefix: `${prefix} :: ${childOpts.prefix}`, color: prefixColor });
    },
  };
};
