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

    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'dark' } });
    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'light' } });
    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'purple' } });
    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'yellow' } });
    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'red' } });
    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'blue' } });
    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'green' } });
    expect(propsHistory).toEqual([]);

    jest.spyOn(isomorphicClerk, 'loaded', 'get').mockReturnValue(true);
    isomorphicClerk.emitLoaded();
    void isomorphicClerk.__unstable__updateProps({ appearance: { baseTheme: 'white' } });
    await jest.runAllTimersAsync();

    expect(propsHistory).toEqual([
      { appearance: { baseTheme: 'dark' } },
      { appearance: { baseTheme: 'light' } },
      { appearance: { baseTheme: 'purple' } },
      { appearance: { baseTheme: 'yellow' } },
      { appearance: { baseTheme: 'red' } },
      { appearance: { baseTheme: 'blue' } },
      { appearance: { baseTheme: 'green' } },
      { appearance: { baseTheme: 'white' } },
    ]);
  });
});
