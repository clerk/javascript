import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { SignInSessionList, SignInSessionListItem } from '../choose-session';
import * as Hooks from '../choose-session.hooks';

describe('SignInSessionList/SignInSessionListItem', () => {
  beforeAll(() => {
    jest.spyOn(Hooks, 'useSignInChooseSessionIsActive').mockImplementation(() => true);
    jest.spyOn(Hooks, 'useSignInActiveSessionList').mockImplementation(() => [
      {
        id: 'abc123',
        firstName: 'firstName',
        lastName: 'lastName',
        imageUrl: 'https://foo.bar/baz.jpg',
        hasImage: true,
        identifier: 'support@clerk.com',
      },
    ]);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should render default ul/li elements', () => {
    const { container } = render(
      <SignInSessionList>
        <SignInSessionListItem>{({ session }) => session.id}</SignInSessionListItem>
      </SignInSessionList>,
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            abc123
          </li>
        </ul>
      </div>
    `);
  });

  it('should render default ul/li elements with children', () => {
    const { container } = render(
      <SignInSessionList>
        <SignInSessionListItem>{({ session }) => <p>{session.id}</p>}</SignInSessionListItem>
      </SignInSessionList>,
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <li>
            <p>
              abc123
            </p>
          </li>
        </ul>
      </div>
    `);
  });

  it('should render default ul with asChild children', () => {
    const { container } = render(
      <SignInSessionList>
        <SignInSessionListItem asChild>{({ session }) => <p>{session.id}</p>}</SignInSessionListItem>
      </SignInSessionList>,
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <ul>
          <p>
            abc123
          </p>
        </ul>
      </div>
    `);
  });

  it('should render asChold list with default li', () => {
    const { container } = render(
      <SignInSessionList asChild>
        <section>
          <SignInSessionListItem>{({ session }) => session.id}</SignInSessionListItem>
        </section>
      </SignInSessionList>,
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section>
          <li>
            abc123
          </li>
        </section>
      </div>
    `);
  });

  it('should render asChild list and items', () => {
    const { container } = render(
      <SignInSessionList asChild>
        <section>
          <SignInSessionListItem asChild>{({ session }) => <p>{session.id}</p>}</SignInSessionListItem>
        </section>
      </SignInSessionList>,
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section>
          <p>
            abc123
          </p>
        </section>
      </div>
    `);
  });

  it('should not allow asChild with a direct child of SessionListItem', () => {
    const consoleErrorFn = jest.spyOn(console, 'error').mockImplementation(() => jest.fn());

    expect(() =>
      render(
        <SignInSessionList asChild>
          <SignInSessionListItem>{() => 'foo'}</SignInSessionListItem>
        </SignInSessionList>,
      ),
    ).toThrow('asChild cannot be used with SessionListItem as the direct child');

    consoleErrorFn.mockRestore();
  });
});
