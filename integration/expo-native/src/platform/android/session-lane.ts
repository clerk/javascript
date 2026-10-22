import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuiltApp } from '../../core/types.ts';
import { LANE_READY, LANE_FAILED } from './emulator.ts';
import { laneSerial, localAndroidBackend } from './local.ts';

const SLOT = 1;

if (import.meta.main) {
  const [command, work = '.'] = process.argv.slice(2);
  if (command === 'serial') {
    console.log(laneSerial(SLOT));
  } else if (command === 'boot') {
    try {
      const lease = await localAndroidBackend().acquire({ platform: 'android', worktree: process.cwd(), waitSeconds: 0, app: null as unknown as BuiltApp, retryWith: '', progress: (line) => console.log(line) });
      if (lease.deviceId !== laneSerial(SLOT)) throw new Error(`the lane came up as ${lease.deviceId}, not ${laneSerial(SLOT)}`);
      writeFileSync(join(work, LANE_READY), `${lease.deviceId}\n`);
    } catch (error) {
      writeFileSync(join(work, LANE_FAILED), `${(error as Error).message}\n`);
      console.error((error as Error).message);
      process.exit(1);
    }
  } else {
    console.error('usage: session-lane.ts serial | boot <work-dir>');
    process.exit(2);
  }
}
