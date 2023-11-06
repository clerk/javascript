# How to add an event

Using the new [events](https://github.com/clerk/javascript/blob/main/packages/clerk-js/src/core/events.ts) module in ClerkJS we can add a new event by defining the following:

```typescript
// file: src/core/events.ts

export const events = {
  // ...
  NewEvent: 'namespace_or_resource:action_or_identifier',
} as const;
// ... after TokenUpdatePayload ...
type NewEventPayload = { something: NewEventType };

type EventPayload = {
  //...
  [events.NewEvent]: EventType<NewEventPayload>;
};
```

Listen to event:

```typescript
import { eventBus, events } from './core/events';

eventBus.on(events.NewEvent, (obj: NewEventPayload) => {
  // do something
});
```

Dispatch event:

```typescript
import { eventBus, events } from './core/events';

const obj: NewEventPayload = { something: ... };
eventBus.dispatch(events.NewEvent, obj);
```

Disable events (if needed):

```typescript
import { eventBus, events } from './core/events';

// all handlers of event
eventBus.off(events.NewEvent);

// specific handler of event
// const handler = (obj: NewEventPayload) => { /* do something */ };
// eventBus.on(events.NewEvent, handler);
eventBus.off(events.NewEvent, handler);
```

## References

[Revamp Cookie Syncing](https://www.notion.so/Revamp-Cookie-Syncing-e9573ff022b24caf8f5a92e6be168b4d)
