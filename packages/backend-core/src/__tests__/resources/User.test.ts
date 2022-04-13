import { User } from '../../api/resources';
import { ObjectType, UserJSON } from '../../api/resources/JSON';

const mockUserDTO: UserJSON = {
  id: 'user_27jbYRV0tbvGovC63JFqaAqZsMy',
  object: ObjectType.User,
  username: 'test001',
  first_name: 'Test',
  last_name: 'Test',
  gender: '',
  birthday: '',
  profile_image_url: 'https://www.gravatar.com/avatar?d=mp',
  primary_email_address_id: 'idn_27jbYTsvdRnRyc5pFqOeD6ZkZ81',
  primary_phone_number_id: 'idn_27jbYTB1izaVaORupvdREuDqqaZ',
  primary_web3_wallet_id: 'test_web3wallet',
  password_enabled: true,
  two_factor_enabled: false,
  email_addresses: [
    {
      id: 'idn_27jbYTsvdRnRyc5pFqOeD6ZkZ81',
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
    },
  ],
  phone_numbers: [
    {
      id: 'idn_27jbYTB1izaVaORupvdREuDqqaZ',
      object: ObjectType.PhoneNumber,
      phone_number: '+15555555555',
      reserved_for_second_factor: false,
      default_second_factor: false,
      verification: {
        id: 'test_verification',
        object: ObjectType.PhoneNumber,
        status: 'verified',
        strategy: 'phone',
        attempts: 0,
        external_verification_redirect_url: '',
        expire_at: 12345,
        nonce: '',
      },
      linked_to: [],
    },
  ],
  web3_wallets: [],
  external_accounts: [],
  public_metadata: { gender: 'female' },
  private_metadata: { middleName: 'Test' },
  unsafe_metadata: { unsafe: 'metadata' },
  external_id: 'a-unique-id',
  last_sign_in_at: 12345,
  created_at: 12345,
  updated_at: 12345,
};

test('user defaults', function () {
  const user = User.fromJSON(mockUserDTO);
  expect(user).toMatchSnapshot();
});
