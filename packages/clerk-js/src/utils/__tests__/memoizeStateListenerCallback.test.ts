// TODO: jest fails because of a circular dependency on Client -> Base -> Client
// This circular dep is a known issue we plan to address soon. Enable the tests then
describe.skip('memoizeStateListenerCallback', () => {
  it.skip('runs', () => {
    // TODO
  });
});

// import { Resources, UserJSON } from '@clerk/types';
//
// const frontEndApi = '';
// const path = '';
//
// describe('memoizeStateListenerCallback', () => {
//   it('returns same user ref if user obj state has not changed', () => {
//     const user1 = new User(frontEndApi, path, {
//       id: 'u1',
//       updated_at: 1,
//       first_name: 'clerk',
//     } as UserJSON);
//
//     const user2 = new User(frontEndApi, path, {
//       id: 'u1',
//       updated_at: 1,
//       first_name: 'clerk',
//     } as UserJSON);
//
//     let calledWith: any;
//     const listener = memoizeListenerCallback(
//       jest.fn((e: Resources) => {
//         console.log(e);
//         calledWith = e.user;
//       }),
//     );
//
//     listener(({ user: user1 } as any) as Resources);
//     listener(({ user: user2 } as any) as Resources);
//     expect(calledWith).toBe(user1);
//   });
// });
