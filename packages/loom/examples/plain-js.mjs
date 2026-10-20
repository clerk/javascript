import { createLoomClient } from '../dist/index.js';

const loom = createLoomClient({
  scope: { instanceKey: 'controlled-example', userId: 'user_demo', sessionId: 'session_current' },
  transport: { read: async () => [], revoke: async () => {} },
});
const unsubscribe = loom.subscribe(result => console.log(result.status, result.data));
await loom.prefetch();
console.log(await loom.fetch());
unsubscribe();
loom.dispose();
