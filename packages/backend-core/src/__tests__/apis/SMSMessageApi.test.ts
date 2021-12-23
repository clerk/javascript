import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { SMSMessage } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('createSMSMessage() sends an SMS message', async () => {
  const phoneNumberId = 'idn_random';
  const message = 'Press F to pay pespects';

  nock('https://api.clerk.dev')
    .post('/v1/sms_messages', snakecaseKeys({ phoneNumberId, message }))
    .replyWithFile(200, __dirname + '/responses/createSMSMessage.json', {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

  const smsMessage = await TestBackendAPIClient.smsMessages.createSMSMessage({
    phoneNumberId,
    message,
  });

  const expected = new SMSMessage({
    fromPhoneNumber: '+19516231001',
    toPhoneNumber: '+306957178227',
    phoneNumberId,
    message,
    status: 'queued',
  });

  expect(smsMessage).toMatchObject(expected);
});
