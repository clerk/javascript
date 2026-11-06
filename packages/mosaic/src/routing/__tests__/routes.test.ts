import { describe, expect, it } from 'vitest';

import { buildParts, compilePattern, compileRoutes, matchRoute, routeParts } from '../routes';

const routes = compileRoutes({
  index: '',
  security: 'security',
  statement: 'billing/statement/:statementId',
});

describe('matchRoute', () => {
  it('matches no parts to the index route', () => {
    expect(matchRoute(routes, [])).toEqual({ name: 'index', params: {} });
  });

  it('matches a static route', () => {
    expect(matchRoute(routes, ['security'])).toEqual({ name: 'security', params: {} });
  });

  it('captures params verbatim', () => {
    expect(matchRoute(routes, ['billing', 'statement', 'st 1'])).toEqual({
      name: 'statement',
      params: { statementId: 'st 1' },
    });
  });

  it('does not match extra parts', () => {
    expect(matchRoute(routes, ['security', 'extra'])).toBeUndefined();
  });

  it('does not decode a part', () => {
    expect(matchRoute(routes, ['billing', 'statement', 'st%201'])).toEqual({
      name: 'statement',
      params: { statementId: 'st%201' },
    });
  });

  it('returns the first route that matches', () => {
    expect(
      matchRoute(compileRoutes({ plans: 'billing/plans', statement: 'billing/:id' }), ['billing', 'plans']),
    ).toEqual({ name: 'plans', params: {} });
  });
});

describe('matchRoute with optional params', () => {
  const optional = compileRoutes({ plan: 'billing/plans/:planId?' });

  it('captures a present optional param', () => {
    expect(matchRoute(optional, ['billing', 'plans', 'pro'])).toEqual({ name: 'plan', params: { planId: 'pro' } });
  });

  it('matches when the optional param is absent', () => {
    expect(matchRoute(optional, ['billing', 'plans'])).toEqual({ name: 'plan', params: {} });
  });

  it('does not match when a required part is missing', () => {
    expect(matchRoute(optional, ['billing'])).toBeUndefined();
  });
});

describe('compilePattern', () => {
  it('ignores leading, trailing and doubled slashes', () => {
    expect(compilePattern('/billing//plans/')).toEqual([
      { param: false, value: 'billing' },
      { param: false, value: 'plans' },
    ]);
  });

  it('rejects an encoded literal', () => {
    expect(compilePattern('api keys')).toEqual([{ param: false, value: 'api keys' }]);
    expect(() => compilePattern('api%20keys')).toThrow('written decoded');
  });

  it('rejects a required part after an optional one', () => {
    expect(() => compilePattern('a/:b?/c')).toThrow('optional parts come last');
    expect(() => compilePattern('a/:b?/:c')).toThrow('optional parts come last');
    expect(compilePattern('a/:b?/:c?')).toHaveLength(3);
  });
});

describe('buildParts', () => {
  it('returns a static pattern unchanged', () => {
    expect(buildParts(compilePattern('security'), {})).toEqual(['security']);
  });

  it('fills params verbatim', () => {
    expect(buildParts(compilePattern('billing/statement/:statementId'), { statementId: 'st 1' })).toEqual([
      'billing',
      'statement',
      'st 1',
    ]);
  });

  it('fills a present optional param', () => {
    expect(buildParts(compilePattern('billing/plans/:planId?'), { planId: 'pro' })).toEqual([
      'billing',
      'plans',
      'pro',
    ]);
  });

  it('drops an absent optional param', () => {
    expect(buildParts(compilePattern('billing/plans/:planId?'), {})).toEqual(['billing', 'plans']);
  });

  it('round-trips any param value through matchRoute', () => {
    for (const value of ['st 1', 'st/1', 'st%2F1', '100%', 'ö', '']) {
      const parts = buildParts(compilePattern('billing/statement/:statementId'), { statementId: value });
      expect(matchRoute(routes, parts)?.params).toEqual({ statementId: value });
    }
  });
});

describe('routeParts', () => {
  const table = { account: 'account', apiKeys: 'api-keys', statement: 'billing/statement/:statementId' };

  it('builds the parts for a route name', () => {
    expect(routeParts(table, 'apiKeys')).toEqual(['api-keys']);
    expect(routeParts(table, 'statement', { statementId: 'st_1' })).toEqual(['billing', 'statement', 'st_1']);
  });

  it('builds no parts for an unknown name', () => {
    expect(routeParts(table, 'nowhere')).toEqual([]);
  });
});
