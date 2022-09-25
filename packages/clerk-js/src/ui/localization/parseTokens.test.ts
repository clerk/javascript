import { applyTokensToString } from './parseTokens';

describe('applyTokensToString', function () {
  const tokens = {
    applicationName: 'myApp',
    'user.fistName': 'nikos',
    identifier: 'nikos@clerk.dev',
    provider: 'google',
  };

  const cases = [
    ['Continue with {{provider|titleize}}', 'Continue with Google'],
    ['Continue with {{         provider | titleize    }}', 'Continue with Google'],
    ['Welcome to {{applicationName}}, have fun', 'Welcome to myApp, have fun'],
    ['Welcome to {{applicationName|titleize}}, have fun', 'Welcome to MyApp, have fun'],
    ['Welcome to {{ applicationName| titleize}}, have fun', 'Welcome to MyApp, have fun'],
    ['This is an {{unknown}} token', 'This is an {{unknown}} token'],
    ['This is an {{applicationName|unknown}} modifier', 'This is an myApp modifier'],
    ['This includes no token', 'This includes no token'],
    ['', ''],
    [undefined, ''],
  ];

  it.each(cases)('.applyTokensToString(%s, tokens) => %s', (input, expected) => {
    expect(applyTokensToString(input, tokens as any)).toEqual(expected);
  });
});
