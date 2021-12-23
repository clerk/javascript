import { Client } from '../../api/resources';

test('client defaults', function () {
  const client = new Client();
  expect(client.sessions).toEqual([]);
});
