import { Waitlist } from '../internal';

describe('Waitlist', () => {
  it('has the same initial properties', () => {
    const waitlist = new Waitlist({
      object: 'waitlist',
      id: 'test_id',
      created_at: 12345,
      updated_at: 5678,
    });

    expect(waitlist).toMatchSnapshot();
  });
});
