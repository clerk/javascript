import type { Options } from 'execa';
import execa from 'execa';

export const chunkLogger = (log: typeof console.log) => (chunk: Buffer) => {
  chunk.toString().trim().split(/\n/).forEach(log);
};

export const run = (cmd: string, options?: Options & { log?: typeof console.log }) => {
  const { log, ...opts } = options || {};
  const [file, ...args] = cmd.split(' ').filter(Boolean);
  // if we're spawning a detached process, we must completely ingore the cp's stdio
  // otherwise the cp will exit when the parent process exits.
  // If we want to log the output of a detached process, we must do it manually
  // by streaming the output to the file and reading the file from the parent process
  const proc = execa(file, args, { ...opts, stdin: opts.detached ? 'ignore' : undefined });
  if (log) {
    proc.stdout?.on('data', chunkLogger(log));
    proc.stderr?.on('data', chunkLogger(log));
  }
  return proc;
};
