import { describe, expect, it } from 'vitest';

import { generateSwiftModels } from './generate-swift-models';

describe('generateSwiftModels', () => {
  const files = generateSwiftModels();
  const byName = new Map(files.map(file => [file.filename, file.contents]));

  it('emits User with id, firstName from first_name, and createdAt: Date', () => {
    const user = byName.get('User.swift');
    expect(user, 'UserJSON must emit User.swift').toBeDefined();
    expect(user, 'User.id is a stable string identifier').toContain('public var id: String');
    expect(user, 'User.firstName comes from first_name').toContain('public var firstName: String?');
    expect(user, 'User.firstName CodingKey is first_name').toContain('case firstName = "first_name"');
    expect(user, 'User.createdAt is Date from created_at milliseconds').toContain('public var createdAt: Date');
    expect(user, 'User.createdAt CodingKey is created_at').toContain('case createdAt = "created_at"');
  });

  it('emits a string union as an enum with unknown(String)', () => {
    const status = byName.get('SessionStatus.swift');
    expect(status, 'SessionStatus is a string-literal union on SessionJSON').toBeDefined();
    expect(status, 'closed string unions keep their known cases').toContain('case active');
    expect(status, 'string unions include unknown(String) for forward compat').toContain('case unknown(String)');
  });

  it('reuses one Swift type per JSON type instead of suffixing copies', () => {
    const client = byName.get('Client.swift');
    expect(client, 'ClientJSON must emit Client.swift').toBeDefined();
    expect(client, 'Client.sessions reuses Session').toContain('public var sessions: [Session]');
    expect(client, 'Client.signIn reuses SignIn').toContain('public var signIn: SignIn?');
    expect(client, 'Client.signUp reuses SignUp').toContain('public var signUp: SignUp?');
    expect(
      files.filter(file => /2\.swift$/.test(file.filename)).map(file => file.filename),
      'the same TypeScript type must not emit Name2.swift copies',
    ).toEqual([]);
  });
});
