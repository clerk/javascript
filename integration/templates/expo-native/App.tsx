import { type ReactElement } from 'react';
import { LogBox } from 'react-native';

import { readVerifyLaunch } from './verify/launch';
import { logRequests, VerifyHost } from './verify/VerifyHost';

const verifyLaunch = readVerifyLaunch();

if (verifyLaunch.runId !== null) {
  LogBox.ignoreAllLogs();
}
if (verifyLaunch.debugLogging) {
  logRequests();
}

export default function App(): ReactElement {
  return <VerifyHost launch={verifyLaunch} />;
}
