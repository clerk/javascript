import { Poller } from '@clerk/shared/poller';

export function createVerificationFlow<Params, Resource>({
  prepare,
  reload,
  isComplete,
}: {
  prepare: (params: Params) => Promise<unknown>;
  reload: () => Promise<Resource>;
  isComplete: (resource: Resource) => boolean;
}): { start: (params: Params) => Promise<Resource>; cancel: () => void } {
  let generation = 0;
  let activePoller: ReturnType<typeof Poller> | undefined;

  const cancel = () => {
    generation += 1;
    activePoller?.stop();
    activePoller = undefined;
  };

  const start = async (params: Params): Promise<Resource> => {
    cancel();
    const attempt = generation;
    await prepare(params);

    return new Promise((resolve, reject) => {
      if (attempt !== generation) {
        return;
      }
      const poller = Poller();
      activePoller = poller;
      const finish = () => {
        poller.stop();
        if (activePoller === poller) {
          activePoller = undefined;
        }
      };

      void poller.run(async () => {
        if (attempt !== generation) {
          finish();
          return;
        }
        try {
          const resource = await reload();
          if (attempt !== generation) {
            finish();
            return;
          }
          if (isComplete(resource)) {
            finish();
            resolve(resource);
          }
        } catch (error) {
          finish();
          if (attempt === generation) {
            reject(error as Error);
          }
        }
      });
    });
  };

  return { start, cancel };
}
