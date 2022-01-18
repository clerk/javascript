// Usage:
// From examples/node, transpile files by running `tsc`
// To run:
// node --require dotenv/config dist/sms_messages.js

import { setClerkServerApiUrl,smsMessages } from '@clerk/clerk-sdk-node';

const serverApiUrl = process.env.CLERK_API_URL || '';
const phoneNumberId = process.env.PHONE_NUMBER_ID || '';

setClerkServerApiUrl(serverApiUrl);

try {
  console.log('Create SMS message');
  const message = "I'd buy that for a dollar";

  let smsMessage = await smsMessages.createSMSMessage({
    message,
    phoneNumberId,
  });

  console.log(smsMessage);
} catch (error) {
  console.log(error);
}
