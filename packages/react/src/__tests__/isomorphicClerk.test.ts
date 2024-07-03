import { IsomorphicClerk } from '../isomorphicClerk';

describe('isomorphicClerk', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('instantiates a IsomorphicClerk instance', () => {
    expect(() => {
      new IsomorphicClerk({ publishableKey: 'pk_test_XXX' });
    }).not.toThrow();
  });

  it('updates props asynchronously after clerkjs has loaded', async () => {
    const propsHistory: any[] = [];
    const dummyClerkJS = {
      __unstable__updateProps: (props: any) => propsHistory.push(props),
    };

    const isomorphicClerk = new IsomorphicClerk({ publishableKey: 'pk_test_XXX' });
    (isomorphicClerk as any).clerkjs = dummyClerkJS as any;

    isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'dark' } });
    isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'light' } });
    isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'purple' } });
    expect(propsHistory).toEqual([]);

    isomorphicClerk.emitLoaded();
    await jest.runAllTimersAsync();
    expect(propsHistory).toEqual([
      { appearance: { baseTheme: 'dark' } },
      { appearance: { baseTheme: 'light' } },
      { appearance: { baseTheme: 'purple' } },
    ]);
  });
});
