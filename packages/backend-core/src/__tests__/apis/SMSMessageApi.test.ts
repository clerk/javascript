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

  const expected = new SMSMessage(
    'test_sms_message_id',
    '+19516231001',
    '+306957178227',
    message,
    'queued',
    phoneNumberId,
  );

  expect(smsMessage).toMatchObject(expected);
});
