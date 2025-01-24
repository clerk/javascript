/**
 * Discards errors thrown by attempted code
 */
const onlyTry = (cb: () => unknown) => {
  try {
    cb();
  } catch (e) {
    // ignore
  }
};

export { onlyTry };
