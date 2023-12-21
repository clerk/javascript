import type { InspectionEvent } from 'xstate';

export const inspect = (inspectionEvent: InspectionEvent) => {
  if (inspectionEvent.type === '@xstate.actor') {
    console.log(inspectionEvent.actorRef.id, inspectionEvent.actorRef);
  }

  if (inspectionEvent.type === '@xstate.event') {
    console.log(inspectionEvent.actorRef.id, inspectionEvent.sourceRef);
    console.log(inspectionEvent.actorRef.id, inspectionEvent.actorRef);
    console.log(inspectionEvent.actorRef.id, inspectionEvent.event);
  }

  if (inspectionEvent.type === '@xstate.snapshot') {
    console.log(inspectionEvent.actorRef.id, inspectionEvent.actorRef);
    console.log(inspectionEvent.actorRef.id, inspectionEvent.event);
    console.log(inspectionEvent.actorRef.id, inspectionEvent.snapshot);
  }
};
