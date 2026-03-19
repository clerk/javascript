/* eslint-disable turbo/no-undeclared-env-vars */

export const shouldLogCiDiagnostics = () => Boolean(process.env.CI);

export const createCiDiagnosticLogger = (prefix: string, debugLog?: (msg: string) => void) => {
  return (msg: string) => {
    debugLog?.(msg);
    if (shouldLogCiDiagnostics()) {
      console.log(`[${prefix}] ${msg}`);
    }
  };
};
