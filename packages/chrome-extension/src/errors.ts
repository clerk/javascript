// error handler that logs the error (used in cookie retrieval and token saving)
export const logErrorHandler = (err: Error) => console.error(err, err.stack);

export class ClerkChromeExtensionError extends Error {
  clerk: boolean = true;

  constructor(message: string) {
    super(`[Clerk: Chrome Extension]: ${message}`);
  }
}
