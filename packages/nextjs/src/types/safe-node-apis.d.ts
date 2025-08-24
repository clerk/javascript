/**
 * Global type declarations for #safe-node-apis conditional import
 */

declare module '#safe-node-apis' {
  import type { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
  import type * as nodePath from 'node:path';

  interface FileSystem {
    existsSync: typeof existsSync;
    writeFileSync: typeof writeFileSync;
    readFileSync: typeof readFileSync;
    appendFileSync: typeof appendFileSync;
    mkdirSync: typeof mkdirSync;
    rmSync: typeof rmSync;
  }

  interface SafeNodeApis {
    fs: FileSystem | undefined;
    path: typeof nodePath | undefined;
    cwd: (() => string) | undefined;
  }

  const safeNodeApis: SafeNodeApis;
  export = safeNodeApis;
}
