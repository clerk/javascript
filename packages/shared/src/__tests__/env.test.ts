import { propsFromEnv } from '../env';

const DUMMY_URL_BASE = 'http://clerk-dummy';

describe('envToProps(props)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FOO: 'foo',
      IS_BAR: 'true',
      IS_QUX: 'false',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('foo', () => {
    expect(propsFromEnv('NEXT_PUBLIC_')()).toEqual({});
    const x = propsFromEnv('NEXT_PUBLIC_')('foo', 'isBar', 'isQux');
    expect(propsFromEnv('NEXT_PUBLIC_')('foo', 'isBar', 'isQux')).toEqual({
      foo: 'foo',
      isBar: true,
      isQux: false,
    });
  });
});
