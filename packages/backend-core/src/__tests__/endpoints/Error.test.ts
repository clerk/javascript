import nock from 'nock';

import { ClerkAPIResponseError } from '../../api/errors';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

const respJSON = {
  errors: [
    {
      message: 'Boom!',
      long_message: 'Boom! Something went wrong.',
      code: 'API_error',
      meta: {
        param_name: 'whatever',
      },
    },
  ],
};

afterEach(() => {
  nock.cleanAll();
});

test('parses error response', async () => {
  nock(defaultServerAPIUrl).get('/v1/users').reply(400, respJSON);
  try {
    await TestClerkAPI.users.getUserList();
  } catch (err) {
    const error = err as ClerkAPIResponseError;

    expect(error.clerkError).toBeTruthy();
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error.errors[0].code).toBe('API_error');
  }
});
