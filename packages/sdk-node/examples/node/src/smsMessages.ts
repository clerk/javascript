// Usage:
// From examples/node, run files with "npm test ./src/smsMessages.ts"
import { smsMessages } from '@clerk/clerk-sdk-node';

const phoneNumberId = process.env.PHONE_NUMBER_ID || '';


try {
  console.log('Create SMS message');
  const message = "I'd buy that for a dollar";

  const smsMessage = await smsMessages.createSMSMessage({
    message,
    phoneNumberId,
  });

  console.log(smsMessage);
} catch (error) {
  console.log(error);
}
