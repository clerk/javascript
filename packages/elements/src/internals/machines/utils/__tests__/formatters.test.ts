import { formatName, formatSalutation } from '../formatters';

describe('formatName', () => {
  test('returns undefined when no arguments are provided', () => {
    expect(formatName()).toBeUndefined();
  });

  test('returns the titleized version of the single argument', () => {
    expect(formatName('john')).toBe('John');
  });

  test('returns the titleized version of multiple arguments joined by space', () => {
    expect(formatName('john', 'doe')).toBe('John Doe');
  });

  test('ignores undefined arguments and returns the titleized version of the rest', () => {
    expect(formatName(undefined, 'john', undefined, 'doe')).toBe('John Doe');
  });
});

describe('formatSalutation', () => {
  test('returns the formatted salutation based on firstName', () => {
    expect(formatSalutation({ firstName: 'John', lastName: undefined, identifier: undefined })).toBe('John');
  });

  test('returns the formatted salutation based on lastName', () => {
    expect(formatSalutation({ firstName: undefined, lastName: 'Doe', identifier: undefined })).toBe('Doe');
  });

  test('returns the formatted salutation based on identifier', () => {
    expect(formatSalutation({ firstName: undefined, lastName: undefined, identifier: 'test@clerk.dev' })).toBe(
      'test@clerk.dev',
    );
  });

  test('returns an empty string when no arguments are provided', () => {
    expect(formatSalutation({ firstName: undefined, lastName: undefined, identifier: undefined })).toBe('');
  });

  test('returns the formatted salutation based on firstName and lastName', () => {
    expect(formatSalutation({ firstName: 'John', lastName: 'Doe', identifier: undefined })).toBe('John');
  });

  test('returns the formatted salutation based on firstName, lastName, and identifier', () => {
    expect(formatSalutation({ firstName: 'John', lastName: 'Doe', identifier: 'test@clerk.dev' })).toBe('John');
  });
});
