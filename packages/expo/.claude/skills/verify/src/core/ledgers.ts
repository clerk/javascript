import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseTestEmail, type ClerkBackend } from './clerk.ts';
import { count } from './state.ts';
import { isRunning } from './exec.ts';
import { newEntryId, openWorkspace, type Workspace } from './workspace.ts';
import type { InstanceName, LedgerEntry, TestEmail } from './types.ts';

export interface PendingIdentity {
  readonly instance: InstanceName;
  readonly email: TestEmail;
  readonly entries: readonly string[];
}

export function pendingIdentities(entries: readonly LedgerEntry[]): readonly PendingIdentity[] {
  const byEmail = new Map<string, { instance: InstanceName; email: TestEmail; entries: string[] }>();
  for (const entry of entries) {
    if (entry.kind !== 'identity' && entry.kind !== 'user') continue;
    const email = parseTestEmail(entry.email);
    const group = byEmail.get(email) ?? { instance: entry.instance, email, entries: [] };
    group.entries.push(entry.id);
    byEmail.set(email, group);
  }
  return [...byEmail.values()];
}

export function stopProcesses(workspace: Workspace): readonly string[] {
  const stopped: string[] = [];
  for (const entry of workspace.unclosedEntries()) {
    if (entry.kind !== 'process') continue;
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

export async function deleteIdentities(workspace: Workspace, clerk: ClerkBackend): Promise<{ readonly users: number; readonly organizations: number }> {
  let users = 0;
  let organizations = 0;
  for (const identity of pendingIdentities(workspace.unclosedEntries())) {
    const deleted = await clerk.deleteByEmail(identity.instance, identity.email);
    users += deleted.users;
    organizations += deleted.organizations;
    for (const ref of identity.entries) workspace.append({ id: newEntryId(), kind: 'done', ref });
  }
  return { users, organizations };
}

export async function finishOrphanLedgers(
  home: string,
  self: string,
  clerk: () => ClerkBackend,
  progress: (line: string) => void,
): Promise<void> {
  const dir = join(home, 'ledgers');
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.owner'))) {
    const worktree = readFileSync(join(dir, name), 'utf8').trim();
    if (worktree === self || existsSync(worktree)) continue;
    const ledger = openWorkspace({ skillDir: join(worktree, '.claude', 'skills', 'verify'), worktree, home });
    if (ledger.unclosedEntries().length === 0) continue;
    try {
      const stopped = stopProcesses(ledger);
      const deleted = await deleteIdentities(ledger, clerk());
      for (const entry of ledger.unclosedEntries()) ledger.append({ id: newEntryId(), kind: 'done', ref: entry.id });
      progress(`reap    ledger of ${worktree}  (worktree is gone)  deleted ${count(deleted.users, 'user')}, ${count(deleted.organizations, 'organization')}, stopped ${stopped.join(', ') || 'nothing'}`);
    } catch (error) {
      progress(`reap    ledger of ${worktree} left open: ${(error as Error).message}`);
    }
  }
}
