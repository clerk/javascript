import { fieldsToSignUpParams } from './fields-to-params';

describe('fieldsToSignUpParams', () => {
  it('converts form fields to sign up params', () => {
    const fields = new Map([
      ['firstName', { value: 'John' }],
      ['emailAddress', { value: 'john@example.com' }],
      ['password', { value: 'password123' }],
    ]);

    const params = fieldsToSignUpParams(fields);

    expect(params).toEqual({
      firstName: 'John',
      emailAddress: 'john@example.com',
      password: 'password123',
    });
  });

  it('ignores undefined values', () => {
    const fields = new Map([
      ['firstName', { value: 'John' }],
      ['emailAddress', { value: undefined }],
      ['password', { value: 'password123' }],
    ]);

    const params = fieldsToSignUpParams(fields);

    expect(params).toEqual({
      firstName: 'John',
      password: 'password123',
    });
  });

  it('ignores non-sign-up keys', () => {
    const fields = new Map([
      ['firstName', { value: 'John' }],
      ['foo', { value: 'bar' }],
      ['bar', { value: 'foo' }],
    ]);

    const params = fieldsToSignUpParams(fields);

    expect(params).toEqual({
      firstName: 'John',
    });
  });
});
