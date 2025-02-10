// @ts-ignore
import treekill from 'tree-kill';

export const awaitableTreekill = (pid: number, signal: string) => {
  return new Promise<void>((resolve, reject) => {
    treekill(pid, signal, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
