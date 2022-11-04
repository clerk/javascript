import type QUnit from 'qunit';

import { joinPaths } from './path';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('joinPaths(...args)');

  test('joins the provides paths safely', assert => {
    assert.equal(joinPaths('foo', '/bar', '/qux//'), 'foo/bar/qux/');
  });
};
