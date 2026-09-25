let enabled = true;

export function disableSimulatedLatency() {
  enabled = false;
}

export function simulatedLatency(ms: number) {
  return enabled ? ms : 0;
}

export function settleAfter(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, simulatedLatency(ms)));
}
