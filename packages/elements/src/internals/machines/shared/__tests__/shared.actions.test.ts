import { sendToLoading } from '../shared.actions';

describe('sendToLoading', () => {
  let context: any;
  let event: any;
  let parentSendMock: jest.Mock;

  beforeEach(() => {
    context = {
      parent: {
        send: jest.fn(),
      },
      loadingStep: new Error('Not implemented'),
    };
    event = {
      type: new Error('Not implemented'),
    };
    parentSendMock = context.parent.send;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should set loading state to false when event type starts with "xstate.done."', () => {
    event.type = 'xstate.done.SOME_EVENT';
    context.loadingStep = 'start';

    sendToLoading({ context, event });

    expect(parentSendMock).toHaveBeenCalledWith({
      type: 'LOADING',
      isLoading: false,
      step: undefined,
      strategy: undefined,
    });
  });

  test('should set loading state to false when event type starts with "xstate.error."', () => {
    event.type = 'xstate.error.SOME_EVENT';
    context.loadingStep = 'start';

    sendToLoading({ context, event });

    expect(parentSendMock).toHaveBeenCalledWith({
      type: 'LOADING',
      isLoading: false,
      step: undefined,
      strategy: undefined,
    });
  });

  test('should set loading state to true with undefined step and defined strategy when context.loadingStep is "strategy" and event.type is "REDIRECT"', () => {
    context.loadingStep = 'strategy';
    event.type = 'REDIRECT';
    event.params = {
      strategy: 'some-strategy',
    };

    sendToLoading({ context, event });

    expect(parentSendMock).toHaveBeenCalledWith({
      type: 'LOADING',
      isLoading: true,
      step: undefined,
      strategy: 'some-strategy',
    });
  });

  test('should set loading state to true with "continue" step and undefined strategy when loadingStep is "continue"', () => {
    context.loadingStep = 'continue';
    event.type = 'SUBMIT';

    sendToLoading({ context, event });

    expect(parentSendMock).toHaveBeenCalledWith({
      type: 'LOADING',
      isLoading: true,
      step: 'continue',
      strategy: undefined,
    });
  });

  test('should set loading state to true with the correct step and undefined strategy when loadingStep is not "strategy" or "continue"', () => {
    context.loadingStep = 'some-step';
    event.type = 'SUBMIT';

    sendToLoading({ context, event });

    expect(parentSendMock).toHaveBeenCalledWith({
      type: 'LOADING',
      isLoading: true,
      step: 'some-step',
      strategy: undefined,
    });
  });
});
