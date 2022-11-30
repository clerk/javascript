import { applyTokensToString } from '../applyTokensToString';

describe('applyTokensToString', function () {
  const tokens = {
    applicationName: 'myApp',
    'user.firstName': 'nikos',
    identifier: 'nikos@hello.dev',
    provider: 'google',
    date: new Date('2021-12-31T22:00:00.000Z'),
    dateString: '2021-12-31T22:00:00.000Z',
    dateNumber: 1640988000000,
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
    [
      'This supports multiple tokens {{user.firstName }} - {{ identifier |titleize}}',
      'This supports multiple tokens nikos - Nikos@hello.dev',
    ],
    ['', ''],
    [undefined, ''],
    ["Last {{ date | weekday('en-US','long') }} at {{ date | timeString('en-US') }}", 'Last Saturday at 12:00 AM'],
    ["Last {{ date | weekday('fr-FR','long') }} at {{ date | timeString('fr-FR') }}", 'Last samedi at 00:00 AM'],
    [
      "Προηγούμενο {{ date | weekday('el-GR','long') }} στις {{ date | timeString('el-GR') }}",
      'Προηγούμενο Σάββατο στις 12:00 π.μ.',
    ],
    [
      "Προηγούμενο {{ date | weekday('el-GR') }} στις {{ date | timeString('el-GR') }}",
      'Προηγούμενο Σάββατο στις 12:00 π.μ.',
    ],
    [
      "Last {{ dateString | weekday('en-US','long') }} at {{ dateString | timeString('en-US') }}",
      'Last Saturday at 12:00 AM',
    ],
    [
      "Last {{ dateNumber | weekday('en-US','long') }} at {{ dateNumber | timeString('en-US') }}",
      'Last Saturday at 12:00 AM',
    ],
    ['Last {{ date | weekday }} at {{ date | timeString }}', 'Last Saturday at 12:00 AM'],
  ];

  it.each(cases)('.applyTokensToString(%s, tokens) => %s', (input, expected) => {
    expect(applyTokensToString(input, tokens as any)).toEqual(expected);
  });
});
