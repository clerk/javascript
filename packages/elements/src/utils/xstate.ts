import type { InspectedEventEvent, InspectionEvent } from 'xstate';

export function createXStateConsoleInspector() {
  const debugEnvVar = process.env.CLERK_ELEMENTS_DEBUG;

  if (!debugEnvVar || (debugEnvVar !== '1' && debugEnvVar?.toLowerCase() !== 'true')) {
    return undefined;
  }

  function logInspectionEventEvent(inspectionEvent: InspectedEventEvent) {
    if (inspectionEvent.event.type === 'xstate.init') {
      // console.log(inspectionEvent.event.type, inspectionEvent.event.input);
    } else {
      console.log(inspectionEvent.event.type, inspectionEvent.event);
    }

    // console.log(inspectionEvent.event.type, inspectionEvent.event);
  }

  return function inspect(inspectionEvent: InspectionEvent) {
    switch (inspectionEvent.type) {
      case '@xstate.actor':
        console.log(inspectionEvent);
        break;
      case '@xstate.event':
        logInspectionEventEvent(inspectionEvent);
        // console.log(inspectionEvent.event.type, inspectionEvent.event);
        break;
      case '@xstate.snapshot':
        break;
    }
  };
}
