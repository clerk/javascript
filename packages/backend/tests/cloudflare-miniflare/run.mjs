import { exit } from 'node:process';
import { Miniflare, Log, LogLevel } from 'miniflare';

const mf = new Miniflare({
  scriptPath: './tests/cloudflare-miniflare/worker.js',
  modules: true, // Enable modules
  log: new Log(LogLevel.DEBUG), // Enable --debug messages
  globalAsyncIO: true, // Allow async I/O outside handlers
  globalTimers: true, // Allow setting timers outside handlers
  globalRandom: true, // Allow secure random generation outside handlers,
});

const res = await mf.dispatchFetch('http://localhost:8787/');

const stats = await res.json();

if (stats.failed > 0) {
  exit(1);
}
