import { join } from 'node:path';
import type { SessionDeviceFactory } from '../src/core/remote/protocol.ts';

const node = process.execPath;
const write = (file: string, text: string) => ({ command: node, args: ['-e', `require('fs').writeFileSync(${JSON.stringify(file)}, ${JSON.stringify(text)})`] });

const fake: SessionDeviceFactory = ({ id: deviceId, platform }) => ({
  build: (work) => [{ command: node, args: ['-e', `require('fs').writeFileSync(${JSON.stringify(join(work, 'built'))}, require('fs').readFileSync('app.txt', 'utf8'))`] }],
  record:
    process.env.FAKE_DEVICE_RECORDER === 'on-device'
      ? {
          start: (file) => ({ command: node, args: ['-e', `const fs = require('fs'); setInterval(() => fs.existsSync(${JSON.stringify(`${file}.stop`)}) && process.exit(0), 50)`] }),
          stop: (file) => [write(`${file}.stop`, '')],
          collect: (file) => [write(file, `pulled from ${platform} ${deviceId}`)],
        }
      : { start: (file) => ({ command: node, args: ['-e', `process.on('SIGINT', () => { require('fs').writeFileSync(${JSON.stringify(file)}, 'video of ${deviceId}'); process.exit(0); }); setInterval(() => {}, 1000)`] }) },
  logs: (_since, predicate) => ({ command: node, args: ['-e', `console.log('log line for ${deviceId} ${predicate ?? ''}')`] }),
});
export default fake;
