/**
 * Attention: Only import this module when the node runtime is used.
 * We are using conditional imports to mitigate bundling issues with Next.js server actions on version prior to 14.1.0.
 */
// @ts-ignore
import nodeRuntime from '#safe-node-apis';

const throwMissingFsModule = (module: string) => {
  throw new Error(`Clerk: ${module} is missing. This is an internal error. Please contact Clerk's support.`);
};

const nodeFsOrThrow = () => {
  if (!nodeRuntime.fs) {
    throwMissingFsModule('fs');
  }
  return nodeRuntime.fs;
};

const nodePathOrThrow = () => {
  if (!nodeRuntime.path) {
    throwMissingFsModule('path');
  }
  return nodeRuntime.path;
};

const nodeCwdOrThrow = () => {
  if (!nodeRuntime.cwd) {
    throwMissingFsModule('cwd');
  }
  return nodeRuntime.cwd;
};

export { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow };
