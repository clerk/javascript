import { createBrowserInspectorReactHook } from '~/react/utils/xstate';

// const snapshotOmitKeys = new Set(['logic', 'input']);
// const actorOmitKeys = new Set(['clerk', 'router']);

// const omitKeys = <T extends AnyEventObject>(obj: T, keys: Set<string>): T => {
//   if (!obj) return obj;
//   for (const key in obj) {
//     if (keys.has(key)) {
//       // @ts-expect-error - TS doesn't like this, but it's fine
//       obj[key] = '[OMITTED]';
//     }
//   }

//   return obj;
// };

export const { useBrowserInspector } = createBrowserInspectorReactHook({
  // options: {
  //   serialize(event) {
  //     if (event.type === '@xstate.event') {
  //       event.event = omitKeys(event.event, snapshotOmitKeys);
  //     } else if (event.type === '@xstate.actor') {
  //       event.snapshot.context = omitKeys(event.snapshot.context, actorOmitKeys);
  //     } else if (event.type === '@xstate.snapshot') {
  //       const snapshot = event.snapshot as AnyMachineSnapshot;
  //       event.event = omitKeys(event.event, snapshotOmitKeys);
  //       if (snapshot.context) {
  //         snapshot.context = omitKeys(snapshot.context, actorOmitKeys);
  //       }
  //     }
  //     return JSON.parse(JSON.stringify(event));
  //   },
  // },
});
