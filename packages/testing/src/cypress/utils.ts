export const experimentalConsoleWarning = () => {
  const message = '@clerk/testing: Cypress is an experimental project and subject to change in the future.';
  console.log('\x1b[33m%s\x1b[0m', message);
};
