import { EmailAddress } from '../../api/resources';

test('email address defaults', function () {
  const emailAddress = new EmailAddress();
  expect(emailAddress.linkedTo).toEqual([]);
});
