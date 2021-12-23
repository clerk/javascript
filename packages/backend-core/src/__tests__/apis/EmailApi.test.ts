import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { Email } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('createEmail() sends an email', async () => {
  const fromEmailName = 'accounting';
  const emailAddressId = 'idn_whatever';
  const subject = 'Your account is in good standing!';
  const body =
    'Click <a href="https://www.knowyourmeme.com/">here</a> to see your most recent transactions.';

  nock('https://api.clerk.dev')
    .post(
      '/v1/emails',
      snakecaseKeys({
        fromEmailName,
        emailAddressId,
        subject,
        body,
      })
    )
    .replyWithFile(200, __dirname + '/responses/createEmail.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const email = await TestBackendAPIClient.emails.createEmail({
    fromEmailName,
    emailAddressId,
    subject,
    body,
  });

  const expected = new Email({
    id: 'ema_yeehaw',
    fromEmailName,
    toEmailAddress: 'chuck@norris.com',
    emailAddressId,
    subject,
    body,
    status: 'queued',
  });

  expect(email).toEqual(expected);
});
