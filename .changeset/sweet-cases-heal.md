---
'@clerk/shared': minor
---

Export `createEventBus` from `@clerk/shared/eventBus`.

```ts
// Create a type-safe event bus
const bus = createEventBus<{
  'user:login': { id: string };
  'error': Error;
}>();

// Subscribe to events
const onLogin = ({ id }: { id: string }) => console.log('User logged in:', id);
bus.on('user:login', onLogin);

// Subscribe with priority (runs before regular handlers)
bus.onBefore('error', (error) => console.error('Error occurred:', error));

// Emit events
bus.emit('user:login', { id: 'user_123' });

// Unsubscribe specific handler
bus.off('user:login', onLogin);

// Unsubscribe all handlers
bus.off('error');
```
