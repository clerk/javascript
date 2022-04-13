import { EmailAddress, EmailAddressJSON, ObjectType } from '../../api/resources';

const mockEmailAddressDTO: EmailAddressJSON = {
  id: 'mock_email_address_id',
  object: ObjectType.EmailAddress,
  email_address: 'test@example.com',
  verification: {
    id: 'test_verification',
    object: ObjectType.Email,
    status: 'verified',
    strategy: 'email',
    attempts: 0,
    external_verification_redirect_url: '',
    expire_at: 12345,
    nonce: '',
  },
  linked_to: [],
};

test('email address defaults', function () {
  const emailAddress = EmailAddress.fromJSON(mockEmailAddressDTO);
  expect(emailAddress).toMatchSnapshot();
});
