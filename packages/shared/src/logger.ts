const loggedMessages: Set<string> = new Set();

export const logger = {
  /**
   * A custom logger that ensures messages are logged only once.
   * Reduces noise and duplicated messages when logs are in a hot codepath.
   */
  warnOnce: (msg: string) => {
    if (loggedMessages.has(msg)) {
      return;
    }

    loggedMessages.add(msg);
    console.warn(msg);
  },
  logOnce: (msg: string) => {
    if (loggedMessages.has(msg)) {
      return;
    }

    console.log(msg);
    loggedMessages.add(msg);
  },
};
