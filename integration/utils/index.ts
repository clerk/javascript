import type { ChildProcess } from 'node:child_process';

import { default as _chalk } from 'chalk';
import type { Options } from 'execa';
// @ts-ignore
import execa from 'execa';
import * as _fs from 'fs-extra';
import _getPort from 'get-port';

export const chunkLogger = (log: typeof console.log) => (chunk: Buffer) => {
  chunk.toString().trim().split(/\n/).forEach(log);
};

export const run = (cmd: string, options?: Options & { log?: typeof console.log }) => {
  const { log, ...opts } = options || {};
  const [file, ...args] = cmd.split(' ').filter(Boolean);
  const proc = execa(file, args, opts);
  if (log) {
    proc.stdout.on('data', chunkLogger(log));
    proc.stderr.on('data', chunkLogger(log));
  }
  return proc;
};

export const getPort = _getPort;
export const chalk = _chalk;
export const fs = _fs;
export { createLogger } from './logger';

export const range = (start: number, stop: number, step = 1): any =>
  Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

const createWaitForIdle = (opts?: { delayInMs: number }) => {
  const { delayInMs = 3000 } = opts || {};
  let id;
  let idler;

  const waitForIdle = new Promise(resolve => {
    idler = () => {
      clearTimeout(id);
      id = setTimeout(resolve, delayInMs);
    };
    idler();
  });

  return { idler, waitForIdle };
};

export const waitForIdleProcess = (cp: ChildProcess, opts?: Parameters<typeof createWaitForIdle>[0]) => {
  const { idler, waitForIdle } = createWaitForIdle(opts);
  cp.stdout.on('data', idler);
  cp.stderr.on('data', idler);
  return waitForIdle;
};
