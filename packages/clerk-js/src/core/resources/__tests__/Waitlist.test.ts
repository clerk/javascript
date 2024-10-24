import { Waitlist } from '../internal';

describe('Organization', () => {
  it('has the same initial properties', () => {
    const organization = new Waitlist({
      object: 'waitlist',
      id: 'test_id',
      created_at: 12345,
      updated_at: 5678,
    });

    expect(organization).toMatchSnapshot();
  });
});
