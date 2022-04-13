import { Client, ClientJSON, ObjectType } from '../../api/resources';

const mockClientDTO: ClientJSON = {
  id: 'mock_client_dto',
  session_ids: ['mock_session_ids'],
  sessions: [
    {
      id: 'mock_session',
      client_id: 'mock_client_id',
      user_id: 'mock_user_id',
      object: ObjectType.Session,
      status: 'mock_status',
      last_active_at: 12345,
      expire_at: 12345,
      abandon_at: 12345,
      created_at: 12345,
      updated_at: 12345,
    },
  ],
  object: ObjectType.Client,
  last_active_session_id: 'mock_active_session_id',
  sign_in_attempt_id: 'mock_attempt_id',
  sign_up_attempt_id: null,
  sign_in_id: null,
  sign_up_id: null,
  created_at: 12345,
  updated_at: 12345,
};

test('client defaults', function () {
  const client = Client.fromJSON(mockClientDTO);
  expect(client).toMatchSnapshot();
});
