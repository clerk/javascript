import type QUnit from 'qunit';

import { joinPaths } from './path';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('utils.joinPaths(...args)');

  test('joins the provides paths safely', assert => {
    assert.equal(joinPaths('foo', '/bar', '/qux//'), 'foo/bar/qux/');
  });

  test('does not affect url scheme', assert => {
    assert.equal(
      joinPaths('https://api.clerk.com', 'v1', '/organizations/org_xxxxxxxxxxxxxxxxx'),
      'https://api.clerk.com/v1/organizations/org_xxxxxxxxxxxxxxxxx',
    );
  });

  test('does not affect url scheme and removes duplicate separators', assert => {
    assert.equal(
      joinPaths('https://api.clerk.com//', '/v1/', '//organizations/org_xxxxxxxxxxxxxxxxx//'),
      'https://api.clerk.com/v1/organizations/org_xxxxxxxxxxxxxxxxx/',
    );
  });
};
