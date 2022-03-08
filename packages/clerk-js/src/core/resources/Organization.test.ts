import { Organization } from 'core/resources/internal';

describe('Organization', () => {
  it('has the same initial properties', () => {
    const organization = new Organization({
      object: 'organization',
      id: 'test_id',
      name: 'test_name',
      created_at: 12345,
      updated_at: 5678,
      created_by: 'test_user_id',
      instance_id: 'test_instance_id',
    });

    expect(organization).toMatchSnapshot();
  });
});
