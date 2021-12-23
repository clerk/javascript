import { User } from '../../api/resources';

test('user defaults', function () {
  const user = new User();
  expect(user.publicMetadata).toEqual({});
  expect(user.privateMetadata).toEqual({});
  expect(user.emailAddresses).toEqual([]);
  expect(user.phoneNumbers).toEqual([]);
  expect(user.externalAccounts).toEqual([]);
});
