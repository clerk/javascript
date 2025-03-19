/**
 * A simple event emitter class for managing event-driven behavior.
 */
export class EventEmitter {
  /**
   * Stores event listeners, mapping event names to sets of callback functions.
   */
  private events: Map<string, Set<(...args: any[]) => void>> = new Map();

  /**
   * Registers a new listener for a specific event.
   *
   * @param event - The name of the event to listen for.
   * @param listener - The callback function to execute when the event is emitted.
   */
  on(event: string, listener: (...args: any[]) => void): void {
    let listeners = this.events.get(event);
    if (!listeners) {
      listeners = new Set();
      this.events.set(event, listeners);
    }
    listeners.add(listener);
  }

  /**
   * Registers a one-time listener for a specific event.
   * The listener is automatically removed after being called once.
   *
   * @param event - The name of the event to listen for.
   * @param listener - The callback function to execute when the event is emitted.
   */
  once(event: string, listener: (...args: any[]) => void): void {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper); // Remove after first execution
      listener(...args);
    };

    // Store a reference mapping for proper removal
    Object.defineProperty(listener, '__onceWrapper', { value: onceWrapper });

    this.on(event, onceWrapper);
  }

  /**
   * Removes a specific listener from an event.
   *
   * @param event - The name of the event.
   * @param listener - The callback function to remove.
   */
  off(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const wrappedListener = (listener as any).__onceWrapper || listener;
      listeners.delete(wrappedListener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emits an event, calling all registered listeners for that event.
   *
   * @param event - The name of the event to emit.
   * @param args - Optional arguments to pass to the event listeners.
   */
  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  /**
   * Removes all listeners for a specific event or clears all events if no event name is provided.
   *
   * @param event - The name of the event to clear. If omitted, all events will be cleared.
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}
