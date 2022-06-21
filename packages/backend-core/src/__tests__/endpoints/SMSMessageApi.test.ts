import nock from 'nock';
import snakecaseKeys from 'snakecase-keys';

import { SMSMessage } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('createSMSMessage() sends an SMS message', async () => {
  const phoneNumberId = 'idn_random';
  const message = 'Press F to pay pespects';

  nock(defaultServerAPIUrl)
    .post('/v1/sms_messages', snakecaseKeys({ phoneNumberId, message }))
    .replyWithFile(200, __dirname + '/responses/createSMSMessage.json', {
      'Content-Type': 'application/json',
    });

  const smsMessage = await TestClerkAPI.smsMessages.createSMSMessage({
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
