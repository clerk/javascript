import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { Email } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('createEmail() sends an email', async () => {
  const fromEmailName = 'accounting';
  const emailAddressId = 'idn_whatever';
  const subject = 'Your account is in good standing!';
  const body = 'Click <a href="https://www.knowyourmeme.com/">here</a> to see your most recent transactions.';

  nock(defaultServerAPIUrl)
    .post(
      '/v1/emails',
      snakecaseKeys({
        fromEmailName,
        emailAddressId,
        subject,
        body,
      }),
    )
    .replyWithFile(200, __dirname + '/responses/createEmail.json', {
      'Content-Type': 'application/json',
    });

  const email = await TestClerkAPI.emails.createEmail({
    fromEmailName,
    emailAddressId,
    subject,
    body,
  });

  const expected = new Email('ema_yeehaw', fromEmailName, emailAddressId, 'chuck@norris.com', subject, body, 'queued');

  expect(email).toEqual(expected);
});
