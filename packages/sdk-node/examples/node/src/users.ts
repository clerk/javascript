// Usage:
// From examples/node, transpile files by running `tsc`
// To run:
// node --require dotenv/config dist/users.js

import { setClerkServerApiUrl, users } from '@clerk/clerk-sdk-node';

const serverApiUrl = process.env.CLERK_API_URL || '';
const userId = process.env.USER_ID || '';
const userIdToDelete = process.env.USER_ID_TO_DELETE || '';

setClerkServerApiUrl(serverApiUrl);

console.log('Create user');
const createdUser = await users.createUser({
  emailAddress: ['test@example.com'],
  phoneNumber: ['+15555555555'],
  externalId: 'a-unique-id',
  firstName: 'Test',
  lastName: 'Test',
  username: 'test001',
  publicMetadata: {
    gender: 'female',
  },
  privateMetadata: {
    middleName: 'Test',
  },
  unsafeMetadata: {
    unsafe: 'metadata',
  },
  password: '123456+ABCd',
});
console.log(createdUser);

console.log('Get user list');
let userList = await users.getUserList();
console.log(userList);

console.log('Get single user');
let user = await users.getUser(userId);
console.log(user);

try {
  console.log('Update user');

  let updatedUser = await users.updateUser(userId, {
    firstName: 'Kyle',
    lastName: 'Reese',
    publicMetadata: {
      zodiac_sign: 'leo',
      ascendant: 'scorpio',
    },
  });

  console.log(updatedUser);
} catch (error) {
  console.log(error);
}

try {
  console.log('Delete user');
  let deletedUser = await users.deleteUser(userIdToDelete);
  console.log(deletedUser);
} catch (error) {
  console.log(error);
}
