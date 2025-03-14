import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventEmitter } from '../EventEmitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  it('calls event listeners when an event is emitted', () => {
    const callback = vi.fn();
    emitter.on('testEvent', callback);
    emitter.emit('testEvent');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to event listeners', () => {
    const callback = vi.fn();
    emitter.on('dataEvent', callback);
    emitter.emit('dataEvent', 'hello', 42);

    expect(callback).toHaveBeenCalledWith('hello', 42);
  });

  it('supports multiple listeners for the same event', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    emitter.on('multiEvent', cb1);
    emitter.on('multiEvent', cb2);
    emitter.emit('multiEvent');

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('removes a specific listener and prevents it from being called', () => {
    const callback = vi.fn();
    emitter.on('removeEvent', callback);
    emitter.off('removeEvent', callback);
    emitter.emit('removeEvent');

    expect(callback).not.toHaveBeenCalled();
  });

  it('removes all listeners for a given event', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    emitter.on('clearEvent', cb1);
    emitter.on('clearEvent', cb2);
    emitter.clear('clearEvent');
    emitter.emit('clearEvent');

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });

  it('clears all listeners when no event is specified', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    emitter.on('event1', cb1);
    emitter.on('event2', cb2);
    emitter.clear();
    emitter.emit('event1');
    emitter.emit('event2');

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });

  it('ignores removal of a non-existent listener', () => {
    const callback = vi.fn();
    emitter.off('nonExistentEvent', callback);
    emitter.emit('nonExistentEvent');

    expect(callback).not.toHaveBeenCalled(); // Ensures no crash or unwanted behavior
  });

  it('handles emitting an event with no listeners gracefully', () => {
    expect(() => emitter.emit('emptyEvent')).not.toThrow();
  });

  it('removes a listener while executing the event without affecting execution', () => {
    const callback = vi.fn(() => {
      emitter.off('selfRemoveEvent', callback);
    });

    emitter.on('selfRemoveEvent', callback);
    emitter.emit('selfRemoveEvent');
    emitter.emit('selfRemoveEvent'); // Should not call callback again

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('allows multiple removals of the same listener without breaking', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    emitter.on('doubleRemoveEvent', cb1);
    emitter.on('doubleRemoveEvent', cb2);
    emitter.off('doubleRemoveEvent', cb1);
    emitter.off('doubleRemoveEvent', cb1); // Removing twice shouldn't cause issues

    emitter.emit('doubleRemoveEvent');

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  describe('once', () => {
    it('executes a one-time listener only once', () => {
      const callback = vi.fn();
      emitter.once('onceEvent', callback);

      emitter.emit('onceEvent');
      emitter.emit('onceEvent'); // Should not trigger again

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to a one-time listener', () => {
      const callback = vi.fn();
      emitter.once('onceArgsEvent', callback);

      emitter.emit('onceArgsEvent', 'hello', 42);

      expect(callback).toHaveBeenCalledWith('hello', 42);
    });

    it('removes a one-time listener automatically after execution', () => {
      const callback = vi.fn();
      emitter.once('autoRemoveEvent', callback);

      emitter.emit('autoRemoveEvent');

      // Emitting again should not call the callback
      emitter.emit('autoRemoveEvent');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not affect other listeners on the same event', () => {
      const onceCallback = vi.fn();
      const regularCallback = vi.fn();

      emitter.once('mixedEvent', onceCallback);
      emitter.on('mixedEvent', regularCallback);

      emitter.emit('mixedEvent');
      emitter.emit('mixedEvent'); // Only `regularCallback` should fire again

      expect(onceCallback).toHaveBeenCalledTimes(1);
      expect(regularCallback).toHaveBeenCalledTimes(2);
    });

    it('does not call the one-time listener if removed before execution', () => {
      const callback = vi.fn();
      emitter.once('removeBeforeEvent', callback);

      emitter.off('removeBeforeEvent', callback);
      emitter.emit('removeBeforeEvent');

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
