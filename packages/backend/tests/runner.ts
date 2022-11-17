import type QUnit from 'qunit';
import suites from './suites';

export default async function runTests(QUnit: QUnit): Promise<QUnit.DoneDetails> {
  QUnit.config.autostart = false;
  // @ts-expect-error
  QUnit.reporters.tap.init(QUnit);

  for (const suite of suites) {
    await suite(QUnit);
  }

  QUnit.start();

  return new Promise(resolve => {
    QUnit.done((details: QUnit.DoneDetails) => {
      resolve(details);
    });
  });
}
