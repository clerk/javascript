/**
 * Attention: Only import this module when the node runtime is used.
 * We are using conditional imports to mitigate bundling issues with Next.js server actions on version prior to 14.1.0.
 */
import nodeRuntime from '#safe-node-apis';

// Generic assertion function that acts as a proper type guard
function assertNotNullable<T>(value: T, moduleName: string): asserts value is NonNullable<T> {
  if (!value) {
    throw new Error(`Clerk: ${moduleName} is missing. This is an internal error. Please contact Clerk's support.`);
  }
}

const nodeFsOrThrow = (): NonNullable<typeof nodeRuntime.fs> => {
  assertNotNullable(nodeRuntime.fs, 'fs');
  return nodeRuntime.fs;
};

const nodePathOrThrow = (): NonNullable<typeof nodeRuntime.path> => {
  assertNotNullable(nodeRuntime.path, 'path');
  return nodeRuntime.path;
};

const nodeCwdOrThrow = (): NonNullable<typeof nodeRuntime.cwd> => {
  assertNotNullable(nodeRuntime.cwd, 'cwd');
  return nodeRuntime.cwd;
};

export { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow };
