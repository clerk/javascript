import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { warnPendingSessionStatus } from '../sessionTasks';

describe('warnPendingSessionStatus', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('does not warn when status is active', () => {
    warnPendingSessionStatus({ id: 'sess_active', status: 'active', currentTask: undefined as any });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when status is pending and includes the session id', () => {
    warnPendingSessionStatus({
      id: 'sess_pending_1',
      status: 'pending',
      currentTask: { key: 'choose-organization' },
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('sess_pending_1');
    expect(warnSpy.mock.calls[0][0]).toContain('pending');
  });

  it('includes the current task key in the message', () => {
    warnPendingSessionStatus({
      id: 'sess_pending_2',
      status: 'pending',
      currentTask: { key: 'choose-organization' },
    });
    expect(warnSpy.mock.calls[0][0]).toContain('choose-organization');
  });

  it('omits the tasks suffix when no current task is present', () => {
    warnPendingSessionStatus({
      id: 'sess_pending_3',
      status: 'pending',
      currentTask: undefined as any,
    });
    expect(warnSpy.mock.calls[0][0]).not.toContain('Remaining session tasks');
  });

  it('dedupes identical messages across calls', () => {
    warnPendingSessionStatus({
      id: 'sess_pending_dedupe',
      status: 'pending',
      currentTask: { key: 'choose-organization' },
    });
    warnPendingSessionStatus({
      id: 'sess_pending_dedupe',
      status: 'pending',
      currentTask: { key: 'choose-organization' },
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('logs again when the task key changes within the same session', () => {
    warnPendingSessionStatus({
      id: 'sess_pending_task_change',
      status: 'pending',
      currentTask: { key: 'choose-organization' },
    });
    warnPendingSessionStatus({
      id: 'sess_pending_task_change',
      status: 'pending',
      currentTask: { key: 'setup-mfa' },
    });
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
