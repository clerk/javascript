import { PhoneNumber } from '../../api/resources';

test('phone number defaults', function () {
  const phoneNumber = new PhoneNumber();
  expect(phoneNumber.linkedTo).toEqual([]);
});
