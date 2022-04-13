import { ObjectType, PhoneNumber, PhoneNumberJSON } from '../../api/resources';

const mockPhoneNumberDTO: PhoneNumberJSON = {
  object: ObjectType.PhoneNumber,
  id: 'mock_phone_number_id',
  phone_number: '+12345678',
  reserved_for_second_factor: true,
  default_second_factor: true,
  linked_to: [],
  verification: null,
};

test('phone number defaults', function () {
  const phoneNumber = PhoneNumber.fromJSON(mockPhoneNumberDTO);
  expect(phoneNumber).toMatchSnapshot();
});
