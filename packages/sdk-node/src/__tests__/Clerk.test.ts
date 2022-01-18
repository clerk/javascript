import Clerk from '../Clerk';

test('getInstance() getter returns a Clerk instance', () => {
  const clerk = Clerk.getInstance();
  expect(clerk).toBeInstanceOf(Clerk);
});

test('getInstance() always returns the same instance', () => {
  const clerk = Clerk.getInstance();
  const clerk2 = Clerk.getInstance();
  expect(clerk2).toBe(clerk);
});

test('separate Clerk instances are not the same object', () => {
  const clerk = new Clerk();
  const clerk2 = new Clerk();
  expect(clerk2).not.toBe(clerk);
});

test('clerkInstance getter returns the same instance of a resource every time', () => {
  const allowlistIdentifiers = Clerk.getInstance().allowlistIdentifiers;
  const allowlistIdentifiers2 = Clerk.getInstance().allowlistIdentifiers;
  expect(allowlistIdentifiers2).toBe(allowlistIdentifiers);
});
