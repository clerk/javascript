import { createScopedContext } from '../scopedContext';

describe('createScopedContext', () => {
  const globalScopedContext = createScopedContext<{ value: string }>();

  it('initially undefined', () => {
    const scopedContext = createScopedContext<{ name: string }>();
    expect(scopedContext.get()).toBeUndefined();
  });

  it('sync', () => {
    const scopedContext = createScopedContext<{ name: string }>();
    void scopedContext.run({ name: 'test' }, () => {
      expect(scopedContext.get()).toEqual({ name: 'test' });
    });
  });

  it('sync callback return', async () => {
    const scopedContext = createScopedContext<{ name: string }>();
    const result = scopedContext.run({ name: 'test' }, () => {
      return scopedContext.get();
    });
    expect(await result).toEqual({ name: 'test' });
  });

  it('async', () => {
    const scopedContext = createScopedContext<{ name: string }>();
    void scopedContext.run({ name: 'test' }, async () => {
      expect(scopedContext.get()).toEqual({ name: 'test' });
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(scopedContext.get()).toEqual({ name: 'test' });
    });
  });

  it('async callback return', async () => {
    const scopedContext = createScopedContext<{ name: string }>();

    const result = scopedContext.run({ name: 'test' }, async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return scopedContext.get();
    });
    expect(await result).toEqual({ name: 'test' });
  });

  it('value inside setTimeout is `undefined`', () => {
    const scopedContext = createScopedContext<{ name: string }>();

    void scopedContext.run({ name: 'test' }, () => {
      expect(scopedContext.get()).toEqual({ name: 'test' });
      setTimeout(() => {
        expect(scopedContext.get()).toBeUndefined();
      }, 0);
    });
  });

  it('nested .run() and .get()', async () => {
    const scopedContext = createScopedContext<{ name: string }>();

    void scopedContext.run({ name: 'test' }, async () => {
      void scopedContext.run({ name: 'before' }, async () => {
        expect(scopedContext.get()).toEqual({ name: 'before' });
      });

      setTimeout(() => {
        void scopedContext.run({ name: 'insideTimeout' }, () => {
          expect(scopedContext.get()).toEqual({ name: 'insideTimeout' });
        });
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(scopedContext.get()).toEqual({ name: 'test' });
      void scopedContext.run({ name: 'after' }, async () => {
        expect(scopedContext.get()).toEqual({ name: 'after' });
      });
    });
  });

  it('global context', async () => {
    expect(globalScopedContext.get()).toBeUndefined();

    await globalScopedContext.run({ value: 'test0' }, () =>
      expect(globalScopedContext.get()).toEqual({ value: 'test0' }),
    );

    await globalScopedContext.run({ value: 'test0' }, async () => {
      expect(globalScopedContext.get()).toEqual({ value: 'test0' });

      const res = await globalScopedContext.run({ value: 'test0_0' }, async () => {
        expect(globalScopedContext.get()).toEqual({ value: 'test0_0' });

        await globalScopedContext.run({ value: 'test0_1' }, () => {
          expect(globalScopedContext.get()).toEqual({ value: 'test0_1' });
        });

        expect(globalScopedContext.get()).toEqual({ value: 'test0_0' });
        return globalScopedContext.get();
      });
      expect(globalScopedContext.get()).toEqual({ value: 'test0' });
      expect(res).toEqual({ value: 'test0_0' });
    });

    expect(globalScopedContext.get()).toBeUndefined();
    // THIS SHOULD PASS expect(globalScopedContext.get()).toBeUndefined();
    // THIS SHOULD FAIL expect(globalScopedContext.get()).toEqual({ value: 'test0' });

    await globalScopedContext.run({ value: 'test1' }, async () => {
      expect(globalScopedContext.get()).toEqual({ value: 'test1' });
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(globalScopedContext.get()).toEqual({ value: 'test1' });
    });

    expect(globalScopedContext.get()).toBeUndefined();
    // THIS SHOULD PASS expect(globalScopedContext.get()).toBeUndefined();
    // THIS SHOULD FAIL expect(globalScopedContext.get()).toEqual({ value: 'test1' });

    await globalScopedContext.run({ value: 'test2' }, async () => {
      expect(globalScopedContext.get()).toEqual({ value: 'test2' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(globalScopedContext.get()).toEqual({ value: 'test2' });
    });
  });

  it('global context nested level 3', async () => {
    expect(globalScopedContext.get()).toBeUndefined();

    await globalScopedContext.run({ value: 'test0' }, async () => {
      expect(globalScopedContext.get()).toEqual({ value: 'test0' });

      const res = await globalScopedContext.run({ value: 'test1' }, async () => {
        expect(globalScopedContext.get()).toEqual({ value: 'test1' });

        await globalScopedContext.run({ value: 'test2' }, () => {
          expect(globalScopedContext.get()).toEqual({ value: 'test2' });
        });

        expect(globalScopedContext.get()).toEqual({ value: 'test1' });
        return globalScopedContext.get();
      });
      expect(globalScopedContext.get()).toEqual({ value: 'test0' });
      expect(res).toEqual({ value: 'test1' });
    });

    expect(globalScopedContext.get()).toBeUndefined();
  });

  /**
   * This test highlights the limitations for the current implementation.
   */
  it('should fail when overlapping asynchronous run calls are not awaited in place and interfere with each other', async () => {
    let contextValue1;
    let contextValue2;

    const promise1 = globalScopedContext.run({ value: 'first' }, async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      contextValue1 = globalScopedContext.get();
      expect(contextValue1).not.toEqual({ value: 'first' });
    });

    const promise2 = await globalScopedContext.run({ value: 'second' }, async () => {
      expect(globalScopedContext.get()).toEqual({ value: 'second' });
      await new Promise(resolve => setTimeout(resolve, 100));
      contextValue2 = globalScopedContext.get();
      expect(contextValue2).not.toEqual({ value: 'second' });
    });

    // Wait for both asynchronous operations to complete.
    await Promise.all([promise1, promise2]);
  });
});
