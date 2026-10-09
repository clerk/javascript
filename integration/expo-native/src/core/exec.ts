import { execFileSync, spawn } from 'node:child_process';
import type { ProcessRef } from './types.ts';

export interface ExecResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface ExecOptions {
  readonly cwd?: string;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly input?: string;
  readonly timeoutMs?: number;
}

export interface CommandLine {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd?: string;
}

export type Runner = (command: string, args: readonly string[], options?: ExecOptions) => Promise<ExecResult>;

export const run: Runner = (command, args, options = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, [...args], {
      cwd: options.cwd,
      env: options.env === undefined ? process.env : { ...options.env },
      stdio: [options.input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk: Buffer) => (stdout += chunk.toString()));
    child.stderr?.on('data', (chunk: Buffer) => (stderr += chunk.toString()));
    let timedOut = false;
    const timer = options.timeoutMs === undefined ? undefined : setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, options.timeoutMs);
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: stderr + error.message });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code: timedOut ? 124 : (code ?? 1), stdout, stderr });
    });
    if (options.input !== undefined) child.stdin?.end(options.input);
  });

export function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export type { ProcessRef };

export function currentProcess(): ProcessRef {
  return { pid: process.pid, startedAt: Date.now() - process.uptime() * 1000 };
}

const PS_WHOLE_SECONDS_SLACK_MS = 3000;

export function isRunning(ref: ProcessRef): boolean {
  if (!isAlive(ref.pid)) return false;
  try {
    const started = Date.parse(execFileSync('ps', ['-o', 'lstart=', '-p', String(ref.pid)], { encoding: 'utf8' }).trim());
    return Number.isNaN(started) || Math.abs(started - ref.startedAt) < PS_WHOLE_SECONDS_SLACK_MS;
  } catch {
    return false;
  }
}
