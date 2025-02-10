import { fieldsToSignUpParams } from '../fields-to-params';

describe('fieldsToSignUpParams', () => {
  it('converts form fields to sign up params', () => {
    const fields = new Map([
      ['firstName', { type: 'text', value: 'John' }],
      ['emailAddress', { type: 'text', value: 'john@example.com' }],
      ['password', { type: 'text', value: 'password123' }],
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
      ['firstName', { type: 'text', value: 'John' }],
      ['emailAddress', { type: 'text', value: undefined }],
      ['password', { type: 'text', value: 'password123' }],
    ]);

    const params = fieldsToSignUpParams(fields);

    expect(params).toEqual({
      firstName: 'John',
      password: 'password123',
    });
  });

  it('ignores non-sign-up keys', () => {
    const fields = new Map([
      ['firstName', { type: 'text', value: 'John' }],
      ['foo', { type: 'text', value: 'bar' }],
      ['bar', { type: 'text', value: 'foo' }],
    ]);

    const params = fieldsToSignUpParams(fields);

    expect(params).toEqual({
      firstName: 'John',
    });
  });
});
