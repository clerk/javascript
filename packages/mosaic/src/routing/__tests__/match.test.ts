import { describe, expect, it } from 'vitest';

import { buildPath, compilePattern, compileRoutes, matchRoute } from '../match';

const routes = compileRoutes({
  index: '',
  security: 'security',
  statement: 'billing/statement/:statementId',
});

describe('matchRoute', () => {
  it('matches the empty path to the index route', () => {
    expect(matchRoute(routes, '')).toEqual({ name: 'index', params: {} });
  });

  it('matches a static route', () => {
    expect(matchRoute(routes, 'security')).toEqual({ name: 'security', params: {} });
  });

  it('ignores leading and trailing slashes', () => {
    expect(matchRoute(routes, '/security/')).toEqual({ name: 'security', params: {} });
  });

  it('captures and decodes params', () => {
    expect(matchRoute(routes, 'billing/statement/st%201')).toEqual({
      name: 'statement',
      params: { statementId: 'st 1' },
    });
  });

  it('does not match a path with extra segments', () => {
    expect(matchRoute(routes, 'security/extra')).toBeUndefined();
  });

  it('keeps a malformed escape as is instead of throwing', () => {
    expect(matchRoute(routes, 'billing/statement/%E0%A4')).toEqual({
      name: 'statement',
      params: { statementId: '%E0%A4' },
    });
  });

  it('does not match an empty param segment', () => {
    expect(matchRoute(routes, 'billing/statement/')).toBeUndefined();
  });

  it('returns the first route that matches', () => {
    expect(matchRoute(compileRoutes({ plans: 'billing/plans', statement: 'billing/:id' }), 'billing/plans')).toEqual({
      name: 'plans',
      params: {},
    });
  });
});

describe('matchRoute with optional params', () => {
  const optional = compileRoutes({ plan: 'billing/plans/:planId?' });

  it('captures a present optional param', () => {
    expect(matchRoute(optional, 'billing/plans/pro')).toEqual({ name: 'plan', params: { planId: 'pro' } });
  });

  it('matches when the optional param is absent', () => {
    expect(matchRoute(optional, 'billing/plans')).toEqual({ name: 'plan', params: {} });
  });

  it('does not match when a required segment is missing', () => {
    expect(matchRoute(optional, 'billing')).toBeUndefined();
  });
});

describe('buildPath', () => {
  it('returns a static pattern unchanged', () => {
    expect(buildPath(compilePattern('security'), {})).toBe('security');
  });

  it('fills and encodes params', () => {
    expect(buildPath(compilePattern('billing/statement/:statementId'), { statementId: 'st 1' })).toBe(
      'billing/statement/st%201',
    );
  });

  it('fills a present optional param', () => {
    expect(buildPath(compilePattern('billing/plans/:planId?'), { planId: 'pro' })).toBe('billing/plans/pro');
  });

  it('drops an absent optional param', () => {
    expect(buildPath(compilePattern('billing/plans/:planId?'), {})).toBe('billing/plans');
  });
});
