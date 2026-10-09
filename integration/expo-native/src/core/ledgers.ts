import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Instances } from './instances/instances.ts';
import { count } from './state.ts';
import { isRunning } from './exec.ts';
import { newEntryId, openWorkspace, type Workspace } from './workspace.ts';
import type { LedgerEntry, Platform } from './types.ts';

export type ProcessEntry = Extract<LedgerEntry, { kind: 'process' }>;

export const openProcesses = (workspace: Workspace): readonly ProcessEntry[] => workspace.unclosedEntries().filter((entry): entry is ProcessEntry => entry.kind === 'process');

export const processesIn = (workspace: Workspace, scope: { readonly platforms: readonly Platform[]; readonly sharedByEveryLease: boolean }): readonly ProcessEntry[] =>
  openProcesses(workspace).filter((entry) => (entry.platform === undefined ? scope.sharedByEveryLease : scope.platforms.includes(entry.platform)));

export function stopProcesses(workspace: Workspace, entries: readonly ProcessEntry[]): readonly string[] {
  const stopped: string[] = [];
  for (const entry of entries) {
    if (isRunning({ pid: entry.pid, startedAt: Date.parse(entry.startedAt) })) {
      try {
        process.kill(entry.pid, entry.what === 'recorder' ? 'SIGINT' : 'SIGTERM');
        stopped.push(`${entry.what} ${entry.pid}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
        stopped.push(`${entry.what} ${entry.pid} had already exited`);
      }
    } else {
      stopped.push(`${entry.what} ${entry.pid} had already exited`);
    }
    workspace.append({ id: newEntryId(), kind: 'done', ref: entry.id });
  }
  return stopped;
}

export interface DaemonInfo {
  readonly pid: number;
  readonly startedAt: number;
}

export function readDaemonInfo(stateDir: string): DaemonInfo | null {
  const file = join(stateDir, 'daemon.json');
  if (!existsSync(file)) return null;
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as { pid?: unknown; processStartTime?: unknown };
    if (typeof raw.pid !== 'number' || typeof raw.processStartTime !== 'string') return null;
    return { pid: raw.pid, startedAt: Date.parse(raw.processStartTime) };
  } catch {
    return null;
  }
}

export function ledgerAgentDeviceDaemon(workspace: Workspace): void {
  const daemon = readDaemonInfo(workspace.agentDeviceDir);
  if (daemon === null || !isRunning(daemon)) return;
  const known = workspace.unclosedEntries().some((e) => e.kind === 'process' && e.what === 'agent-device' && e.pid === daemon.pid);
  if (!known) workspace.append({ id: newEntryId(), kind: 'process', what: 'agent-device', pid: daemon.pid, startedAt: new Date(daemon.startedAt).toISOString() });
}

export async function finishOrphanLedgers(
  home: string,
  self: string,
  instances: Instances,
  progress: (line: string) => void,
): Promise<void> {
  const dir = join(home, 'ledgers');
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.owner'))) {
    const [worktree = '', packageDir] = readFileSync(join(dir, name), 'utf8').trim().split('\n');
    if (worktree === self || existsSync(worktree)) continue;
    const ledger = openWorkspace({ packageDir: packageDir ?? worktree, worktree, home });
    if (ledger.unclosedEntries().length === 0) continue;
    try {
      const stopped = stopProcesses(ledger, openProcesses(ledger));
      const deleted = await instances.finish(ledger, { keepApplications: false }, progress);
      for (const entry of ledger.unclosedEntries()) ledger.append({ id: newEntryId(), kind: 'done', ref: entry.id });
      progress(`reap    ledger of ${worktree}  (worktree is gone)  deleted ${count(deleted.length, 'application')}, stopped ${stopped.join(', ') || 'nothing'}`);
    } catch (error) {
      progress(`reap    ledger of ${worktree} left open: ${(error as Error).message}`);
    }
  }
}
