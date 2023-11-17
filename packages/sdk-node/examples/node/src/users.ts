// Usage:
// From examples/node, run files with "npm test ./src/users.ts"
import { users } from '@clerk/clerk-sdk-node';

console.log('Create user');
const { data: createdUser, errors: createUserErrors } = await users.createUser({
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
if (createUserErrors) {
  throw new Error(createUserErrors);
}
console.log(createdUser);
const createdUserId = createdUser.id as string;

console.log('Get single user');
const { data: user, errors: userErrors } = await users.getUser(createdUserId);
if (userErrors) {
  throw new Error(userErrors);
}
console.log(user);

await users.deleteUser(createdUserId);

console.log('Get user list');
const { data: userList, errors: userListErrors } = await users.getUserList();
if (userListErrors) {
  throw new Error(userListErrors);
}
console.log(userList);

console.log('Update user');

const { user: updatedUser, errors: updateUserErrors } = await users.updateUser(createdUserId, {
  firstName: 'Kyle',
  lastName: 'Reese',
  publicMetadata: {
    zodiac_sign: 'leo',
    ascendant: 'scorpio',
  },
});
if (updateUserErrors) {
  throw new Error(updateUserErrors);
}
console.log(updatedUser);

console.log('Get total count of users');
const { data: count, errors: countErrors } = await users.getCount();
if (countErrors) {
  throw new Error(countErrors);
}
console.log(count);
