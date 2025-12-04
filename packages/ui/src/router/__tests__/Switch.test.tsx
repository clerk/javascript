import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { HashRouter, Route, Switch } from '../../router';

const mockNavigate = vi.fn();

vi.mock('@clerk/shared/react', () => ({
  useClerk: () => ({
    navigate: vi.fn(to => {
      mockNavigate(to);
      if (to) {
        // @ts-ignore
        window.location = new URL(to, window.location.origin);
      }
      return Promise.resolve();
    }),
  }),
}));

const oldWindowLocation = window.location;
const setWindowOrigin = (origin: string) => {
  // @ts-ignore
  delete window.location;
  // the URL interface is very similar to window.location
  // we use it to easily mock the location methods in tests
  (window.location as any) = new URL(origin);
};

describe('<Switch >', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    window.location = oldWindowLocation;
  });

  it('ignores nodes that are not of type Route', () => {
    setWindowOrigin('http://dashboard.example.com/#/first');
    render(
      <HashRouter>
        <Switch>
          hey
          <Route path='first'>first</Route>
        </Switch>
      </HashRouter>,
    );

    expect(screen.queryByText('hey')).toBeNull();
    expect(screen.queryByText('first 1')).toBeDefined();
  });

  it('renders only the first Route that matches', () => {
    setWindowOrigin('http://dashboard.example.com/#/first');
    render(
      <HashRouter>
        <Switch>
          <Route path='first'>first 1</Route>
          <Route path='first'>first 2</Route>
          <Route>catchall</Route>
        </Switch>
      </HashRouter>,
    );

    expect(screen.queryByText('first 1')).toBeDefined();
    expect(screen.queryByText('first 2')).toBeNull();
    expect(screen.queryByText('catchall')).toBeNull();
  });

  it('renders null if no route matches', () => {
    setWindowOrigin('http://dashboard.example.com/#/cat');
    render(
      <HashRouter>
        <Switch>
          <Route path='first'>first</Route>
          <Route path='second'>second</Route>
          <Route path='third'>third</Route>
        </Switch>
      </HashRouter>,
    );

    expect(screen.queryByText('first')).toBeNull();
    expect(screen.queryByText('second')).toBeNull();
    expect(screen.queryByText('third')).toBeNull();
  });

  it('always matches a Route without path', () => {
    setWindowOrigin('http://dashboard.example.com/#/cat');
    render(
      <HashRouter>
        <Switch>
          <Route path='first'>first 1</Route>
          <Route path='first'>first 2</Route>
          <Route>catchall</Route>
        </Switch>
      </HashRouter>,
    );

    expect(screen.queryByText('first 1')).toBeNull();
    expect(screen.queryByText('first 2')).toBeNull();
    expect(screen.queryByText('catchall')).toBeDefined();
  });

  it('always matches a Route without path even when other routes match down the tree', () => {
    setWindowOrigin('http://dashboard.example.com/#/first');
    render(
      <HashRouter>
        <Switch>
          <Route>catchall</Route>
          <Route path='first'>first</Route>
        </Switch>
      </HashRouter>,
    );

    expect(screen.queryByText('catchall')).toBeDefined();
    expect(screen.queryByText('firs')).toBeNull();
  });

  it('always matches a Route without path even if its an index route', () => {
    setWindowOrigin('http://dashboard.example.com/#/first');
    render(
      <HashRouter>
        <Switch>
          <Route index>catchall</Route>
          <Route path='first'>first</Route>
        </Switch>
      </HashRouter>,
    );

    expect(screen.queryByText('catchall')).toBeDefined();
    expect(screen.queryByText('firs')).toBeNull();
  });
});
