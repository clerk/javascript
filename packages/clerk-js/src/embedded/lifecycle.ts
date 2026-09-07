import type { Clerk } from '../core/clerk';
import type { Environment } from '../core/resources/internal';

export function createEmbeddedLifecycle(clerk: Clerk, commit: () => Promise<void>) {
  let active = true;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  let needsResourceRefresh = false;
  let refresh: Promise<void> | undefined;

  function schedule() {
    clearTimeout(timer);
    if (!active || disposed) {
      return;
    }
    const delay = failures ? Math.min(5000 * 2 ** Math.min(failures, 4), 60000) * (0.8 + Math.random() * 0.4) : 5000;
    timer = setTimeout(() => void poll(), delay);
  }

  async function token() {
    if (active && !disposed && clerk.session?.status === 'active') {
      await clerk.session.getToken();
    }
  }

  async function poll() {
    try {
      if (needsResourceRefresh) {
        await refreshResources();
      } else {
        await token();
        await commit();
      }
      failures = 0;
    } catch {
      failures += 1;
    } finally {
      schedule();
    }
  }

  function refreshResources() {
    if (!refresh) {
      refresh = (async () => {
        const results = await Promise.allSettled([
          (async () => {
            const client = await clerk.client?.reload();
            if (!disposed && client) {
              clerk.updateClient(client);
            }
            await token();
          })(),
          (async () => {
            const environment = await (clerk.__internal_environment as Environment | undefined)?.fetch();
            if (!disposed && environment) {
              clerk.updateEnvironment(environment);
            }
          })(),
        ]);
        if (!disposed) {
          await commit();
        }
        const failed = results.find(result => result.status === 'rejected');
        needsResourceRefresh = Boolean(failed);
        if (failed?.status === 'rejected') {
          throw failed.reason;
        }
      })().finally(() => {
        refresh = undefined;
      });
    }
    return refresh;
  }

  return {
    start() {
      needsResourceRefresh = clerk.status === 'degraded';
      schedule();
    },
    async setActive(value: boolean, refreshOnForeground = true) {
      active = value;
      clearTimeout(timer);
      if (!active || disposed) {
        return;
      }
      failures = 0;
      try {
        if (refreshOnForeground) {
          await refreshResources();
        }
      } finally {
        schedule();
      }
    },
    dispose() {
      disposed = true;
      active = false;
      clearTimeout(timer);
    },
  };
}
