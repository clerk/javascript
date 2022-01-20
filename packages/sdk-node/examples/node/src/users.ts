// Usage:
// From examples/node, run files with "npm test ./src/users.ts"
import { users } from '@clerk/clerk-sdk-node';

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
const createdUserId = createdUser.id as string;

console.log('Get user list');
const userList = await users.getUserList();
console.log(userList);

console.log('Get single user');
const user = await users.getUser(createdUserId);
console.log(user);

try {
  console.log('Update user');

  const updatedUser = await users.updateUser(createdUserId, {
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
  const deletedUser = await users.deleteUser(createdUserId);
  console.log(deletedUser);
} catch (error) {
  console.log(error);
}
