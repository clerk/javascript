import { createActor, SimulatedClock } from 'xstate';

import { TimerDelays, TimerMachine } from '../timer.machine';

describe('TimerMachine', () => {
  const simulatedClock = new SimulatedClock();
  const initial = 2;
  const input = { initial };

  it('should start in the Idle state', () => {
    const service = createActor(TimerMachine, { input }).start();
    const snapshot = service.getSnapshot();

    expect(snapshot.hasTag('idle')).toBe(true);
    expect(snapshot.context).toMatchObject({
      initial: initial,
      remaining: initial,
    });
  });

  it('should transition to Running state on START', () => {
    const service = createActor(TimerMachine, { input }).start();

    service.send({ type: 'START' });

    const snapshot = service.getSnapshot();

    expect(snapshot.hasTag('running')).toBe(true);
    expect(snapshot.context.remaining).toBe(initial);
  });

  it('should transition to Idle state on STOP', () => {
    const service = createActor(TimerMachine, { input }).start();

    service.send({ type: 'START' });
    expect(service.getSnapshot().hasTag('running')).toBe(true);

    service.send({ type: 'STOP' });
    expect(service.getSnapshot().hasTag('idle')).toBe(true);
  });

  it('should reset the timer on RESET', () => {
    const service = createActor(TimerMachine, { input }).start();

    expect(service.getSnapshot().context).toMatchObject({
      initial: input.initial,
      remaining: input.initial,
      timeout: TimerDelays.timeout,
    });

    const updatedInitial = 4;
    const updatedTimeout = 2000;

    service.send({ type: 'RESET', initial: updatedInitial, timeout: updatedTimeout });

    expect(service.getSnapshot().context).toMatchObject({
      initial: updatedInitial,
      remaining: updatedInitial,
      timeout: updatedTimeout,
    });
  });

  it('should decrement the timer after timeout', () => {
    const service = createActor(TimerMachine, {
      clock: simulatedClock,
      input: {
        initial: 5,
      },
    }).start();

    const handler = jest.fn();

    service.send({ type: 'START' });
    service.on('*', event => {
      expect(event).toMatchObject({ type: 'tick', remaining: expect.any(Number) });
      handler();
    });

    simulatedClock.increment(1000);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should advance to complete', () => {
    const service = createActor(TimerMachine, {
      clock: simulatedClock,
      input: {
        initial: 0,
      },
    }).start();

    expect(service.getSnapshot().hasTag('idle')).toBe(true);

    service.send({ type: 'START' });
    expect(service.getSnapshot().hasTag('running')).toBe(true);

    simulatedClock.increment(1000);
    expect(service.getSnapshot().hasTag('complete')).toBe(true);
  });
});
