import type { CustomPage } from '@clerk/types';

import { createUserProfileCustomPages } from '../createCustomPages';

describe('createUserProfileCustomPages', () => {
  it('should return the default pages if no custom pages are passed', () => {
    const { routes, contents } = createUserProfileCustomPages([]);
    expect(routes.length).toEqual(2);
    expect(routes[0].id).toEqual('account');
    expect(routes[1].id).toEqual('security');
    expect(contents.length).toEqual(0);
  });

  it('should return the custom pages after the default pages', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      {
        label: 'Custom2',
        url: 'custom2',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes, contents } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[0].id).toEqual('account');
    expect(routes[1].id).toEqual('security');
    expect(routes[2].name).toEqual('Custom1');
    expect(routes[3].name).toEqual('Custom2');
    expect(contents.length).toEqual(2);
    expect(contents[0].url).toEqual('custom1');
    expect(contents[1].url).toEqual('custom2');
  });

  it('should reorder the default pages when their label is used to target them', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      { label: 'account' },
      { label: 'security' },
      {
        label: 'Custom2',
        url: 'custom2',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes, contents } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[0].name).toEqual('Custom1');
    expect(routes[1].id).toEqual('account');
    expect(routes[2].id).toEqual('security');
    expect(routes[3].name).toEqual('Custom2');
    expect(contents.length).toEqual(2);
    expect(contents[0].url).toEqual('custom1');
    expect(contents[1].url).toEqual('custom2');
  });

  it('ignores invalid entries', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      { label: 'account' },
      { label: 'security' },
      { label: 'Aaaaaa' },
      { label: 'account', mount: () => undefined },
      {
        label: 'Custom2',
        url: 'custom2',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[0].name).toEqual('Custom1');
    expect(routes[1].id).toEqual('account');
    expect(routes[2].id).toEqual('security');
    expect(routes[3].name).toEqual('Custom2');
  });

  it('sets the path of the first page to be the root (/)', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      { label: 'account' },
      { label: 'security' },
      {
        label: 'Custom2',
        url: 'custom2',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[0].path).toEqual('/');
    expect(routes[1].path).toEqual('account');
    expect(routes[2].path).toEqual('account');
    expect(routes[3].path).toEqual('custom2');
  });

  it('sets the path of both account and security pages to root (/) if account is first', () => {
    const customPages: CustomPage[] = [
      { label: 'account' },
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      { label: 'security' },
      {
        label: 'Custom2',
        url: 'custom2',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[0].path).toEqual('/');
    expect(routes[1].path).toEqual('custom1');
    expect(routes[2].path).toEqual('/');
    expect(routes[3].path).toEqual('custom2');
  });

  it('sets the path of both account and security pages to root (/) if security is first', () => {
    const customPages: CustomPage[] = [
      { label: 'security' },
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      { label: 'account' },
      {
        label: 'Custom2',
        url: 'custom2',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[0].path).toEqual('/');
    expect(routes[1].path).toEqual('custom1');
    expect(routes[2].path).toEqual('/');
    expect(routes[3].path).toEqual('custom2');
  });

  it('throws if the first item in the navbar is an external link', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Link1',
        url: '/link1',
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      { label: 'account' },
      { label: 'security' },
      {
        label: 'Custom2',
        url: 'custom2',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    expect(() => createUserProfileCustomPages(customPages)).toThrow();
  });

  it('adds an external link to the navbar routes', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      {
        label: 'Link1',
        url: '/link1',
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes, contents } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[0].id).toEqual('account');
    expect(routes[1].id).toEqual('security');
    expect(routes[2].name).toEqual('Custom1');
    expect(routes[3].name).toEqual('Link1');
    expect(contents.length).toEqual(1);
    expect(contents[0].url).toEqual('custom1');
  });

  it('sanitizes the path for external links', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Link1',
        url: 'https://www.fullurl.com',
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      {
        label: 'Link2',
        url: '/url-with-slash',
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      {
        label: 'Link3',
        url: 'url-without-slash',
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(5);
    expect(routes[2].path).toEqual('https://www.fullurl.com');
    expect(routes[3].path).toEqual('/url-with-slash');
    expect(routes[4].path).toEqual('/url-without-slash');
  });

  it('sanitizes the path for custom pages', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Page1',
        url: '/url-with-slash',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      {
        label: 'Page2',
        url: 'url-without-slash',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    const { routes } = createUserProfileCustomPages(customPages);
    expect(routes.length).toEqual(4);
    expect(routes[2].path).toEqual('url-with-slash');
    expect(routes[3].path).toEqual('url-without-slash');
  });

  it('throws when a custom page has an absolute URL', () => {
    const customPages: CustomPage[] = [
      {
        label: 'Page1',
        url: 'https://www.fullurl.com',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];
    expect(() => createUserProfileCustomPages(customPages)).toThrow();
  });
});
