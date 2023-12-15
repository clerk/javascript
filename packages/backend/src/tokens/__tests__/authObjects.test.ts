import type QUnit from 'qunit';

import { makeAuthObjectSerializable, signedOutAuthObject } from '../authObjects';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('makeAuthObjectSerializable', () => {
    test('removes non-serializable props', assert => {
      const authObject = signedOutAuthObject();
      const serializableAuthObject = makeAuthObjectSerializable(authObject);

      for (const key in serializableAuthObject) {
        assert.notStrictEqual(typeof serializableAuthObject[key], 'function');
      }
    });
  });
};
