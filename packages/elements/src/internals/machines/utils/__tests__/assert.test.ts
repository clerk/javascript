import { assertActorEventDone, assertActorEventError, assertIsDefined } from '../assert';

describe('assertIsDefined', () => {
  it('should throw an error if the value is undefined', () => {
    const value = undefined;
    expect(() => assertIsDefined(value)).toThrowError('undefined is not defined');
  });

  it('should throw an error if the value is null', () => {
    const value = null;
    expect(() => assertIsDefined(value)).toThrowError('null is not defined');
  });

  it('should not throw an error if the value is defined', () => {
    const value = 'Hello';
    expect(() => assertIsDefined(value)).not.toThrowError();
  });
});

describe('assertActorEventError', () => {
  it('should throw an error if the event is not an error event', () => {
    const event = { type: 'success' };
    expect(() => assertActorEventError(event)).toThrowError('Expected an error event, got "success"');
  });

  it('should not throw an error if the event is an error event', () => {
    const event = { type: 'error', error: new Error('Something went wrong') };
    expect(() => assertActorEventError(event)).not.toThrowError();
  });
});

describe('assertActorEventDone', () => {
  it('should throw an error if the event is not a done event', () => {
    const event = { type: 'success' };
    expect(() => assertActorEventDone(event)).toThrowError('Expected a done event, got "success"');
  });

  it('should not throw an error if the event is a done event', () => {
    const event = { type: 'done', output: 'Result' };
    expect(() => assertActorEventDone(event)).not.toThrowError();
  });
});
