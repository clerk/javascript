import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createEventBus } from '../eventBus';

// Define types for our test events
type TestEvents = {
  'test-event': string;
  'test-event-with-object': { message: string; id: number };
  'test-event-with-number': number;
};

describe('eventBus', () => {
  let eventBus = createEventBus<TestEvents>();

  beforeEach(() => {
    // Reset event bus before each test
    eventBus = createEventBus<TestEvents>();
  });

  describe('on()', () => {
    it('registers an event handler', () => {
      // Arrange
      const handler = vi.fn();

      // Act
      eventBus.on('test-event', handler);

      // Assert
      const listeners = eventBus.internal.retrieveListeners('test-event');
      expect(listeners).toHaveLength(1);
      expect(listeners[0]).toBe(handler);
    });

    it('registers multiple handlers for the same event', () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      // Act
      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);

      // Assert
      const listeners = eventBus.internal.retrieveListeners('test-event');
      expect(listeners).toHaveLength(2);
      expect(listeners).toContain(handler1);
      expect(listeners).toContain(handler2);
    });

    it('calls handler immediately with notify=true if there is a latest payload', () => {
      // Arrange
      const handler = vi.fn();
      const payload = 'test-message';

      // Act
      eventBus.emit('test-event', payload);
      eventBus.on('test-event', handler, { notify: true });

      // Assert
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('does not call handler with notify=false even if there is a latest payload', () => {
      // Arrange
      const handler = vi.fn();
      const payload = 'test-message';

      // Act
      eventBus.emit('test-event', payload);
      eventBus.on('test-event', handler, { notify: false });

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });

    it('does not call handler without notify option even if there is a latest payload', () => {
      // Arrange
      const handler = vi.fn();
      const payload = 'test-message';

      // Act
      eventBus.emit('test-event', payload);
      eventBus.on('test-event', handler);

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('prioritizedOn()', () => {
    it('registers a pre-dispatch event handler', () => {
      // Arrange
      const handler = vi.fn();

      // Act
      eventBus.prioritizedOn('test-event', handler);

      // Assert - using dispatch to verify pre-dispatch handler is called
      const payload = 'test-message';
      eventBus.emit('test-event', payload);
      expect(handler).toHaveBeenCalledWith(payload);
    });
  });

  describe('emit()', () => {
    it('calls all handlers for the given event', () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const payload = 'test-message';

      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);

      // Act
      eventBus.emit('test-event', payload);

      // Assert
      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
    });

    it('calls handlers with object payload', () => {
      // Arrange
      const handler = vi.fn();
      const payload = { message: 'test-message', id: 123 };

      eventBus.on('test-event-with-object', handler);

      // Act
      eventBus.emit('test-event-with-object', payload);

      // Assert
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('calls prioritized handlers before regular handlers', () => {
      // Arrange
      const calls: string[] = [];
      const preHandler = vi.fn(() => calls.push('pre'));
      const regularHandler = vi.fn(() => calls.push('regular'));
      const payload = 'test-message';

      eventBus.prioritizedOn('test-event', preHandler);
      eventBus.on('test-event', regularHandler);

      // Act
      eventBus.emit('test-event', payload);

      // Assert
      expect(calls).toEqual(['pre', 'regular']);
      expect(preHandler).toHaveBeenCalledWith(payload);
      expect(regularHandler).toHaveBeenCalledWith(payload);
    });

    it('updates latest payload for subsequent notify=true subscriptions', () => {
      // Arrange
      const payload1 = 'test-message-1';
      const payload2 = 'test-message-2';
      const handler = vi.fn();

      // Act
      eventBus.emit('test-event', payload1);
      eventBus.emit('test-event', payload2);
      eventBus.on('test-event', handler, { notify: true });

      // Assert
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(payload2);
    });

    it('does not call handlers for other events', () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test-event', handler1);
      eventBus.on('test-event-with-number', handler2);

      // Act
      eventBus.emit('test-event', 'test-message');

      // Assert
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('off()', () => {
    it('removes a specific handler for an event', () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);

      // Act
      eventBus.off('test-event', handler1);
      eventBus.emit('test-event', 'test-message');

      // Assert
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('removes all handlers for an event when handler is not specified', () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);

      // Act
      eventBus.off('test-event');
      eventBus.emit('test-event', 'test-message');

      // Assert
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(eventBus.internal.retrieveListeners('test-event')).toHaveLength(0);
    });
  });

  describe('offPreDispatch()', () => {
    it('removes a specific pre-dispatch handler', () => {
      // Arrange
      const preHandler1 = vi.fn();
      const preHandler2 = vi.fn();

      eventBus.prioritizedOn('test-event', preHandler1);
      eventBus.prioritizedOn('test-event', preHandler2);

      // Act
      eventBus.prioritizedOff('test-event', preHandler1);
      eventBus.emit('test-event', 'test-message');

      // Assert
      expect(preHandler1).not.toHaveBeenCalled();
      expect(preHandler2).toHaveBeenCalledTimes(1);
    });

    it('removes all pre-dispatch handlers when handler is not specified', () => {
      // Arrange
      const preHandler1 = vi.fn();
      const preHandler2 = vi.fn();

      eventBus.prioritizedOn('test-event', preHandler1);
      eventBus.prioritizedOff('test-event', preHandler2);

      // Act
      eventBus.prioritizedOff('test-event');
      eventBus.emit('test-event', 'test-message');

      // Assert
      expect(preHandler1).not.toHaveBeenCalled();
      expect(preHandler2).not.toHaveBeenCalled();
    });
  });

  describe('internal.retrieveListeners()', () => {
    it('returns an empty array for events with no listeners', () => {
      // Act & Assert
      expect(eventBus.internal.retrieveListeners('test-event')).toEqual([]);
    });

    it('returns all registered listeners for an event', () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);

      // Act & Assert
      const listeners = eventBus.internal.retrieveListeners('test-event');
      expect(listeners).toHaveLength(2);
      expect(listeners).toContain(handler1);
      expect(listeners).toContain(handler2);
    });
  });
});
