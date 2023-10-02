import type { Options } from 'execa';
import execa from 'execa';

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
