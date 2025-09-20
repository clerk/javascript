import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  ];

  it.each(cases)('.applyTokensToString(%s, tokens) => %s', (input, expected) => {
    expect(applyTokensToString(input, tokens as any)).toEqual(expected);
  });

  describe('Date related tokens and modifiers', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    const tokens = {
      date: new Date('2021-12-31T22:00:00.000Z'),
      dateString: '2021-12-31T22:00:00.000Z',
      dateNumber: 1640988000000,
      errorString: 'test_error_case',
    };

    const cases = [
      ["Last {{ date | weekday('en-US','long') }} at {{ date | timeString('en-US') }}", 'Last Friday at 10:00 PM'],
      ["Last {{ date | weekday('fr-FR','long') }} at {{ date | timeString('fr-FR') }}", 'Last vendredi at 22:00'],
      [
        "Last {{ date | weekday('fr-FR','long') | titleize }} at {{ date | timeString('fr-FR') }}",
        'Last Vendredi at 22:00',
      ],
      [
        "Προηγούμενη {{ date | weekday('el-GR','long') }} στις {{ date | timeString('el-GR') }}",
        'Προηγούμενη Παρασκευή στις 10:00 μ.μ.',
      ],
      [
        "Προηγούμενη {{ date | weekday('el-GR') }} στις {{ date | timeString('el-GR') }}",
        'Προηγούμενη Παρασκευή στις 10:00 μ.μ.',
      ],
      [
        "Last {{ dateString | weekday('en-US','long') }} at {{ dateString | timeString('en-US') }}",
        'Last Friday at 10:00 PM',
      ],
      [
        "Last {{ dateNumber | weekday('en-US','long') }} at {{ dateNumber | timeString('en-US') }}",
        'Last Friday at 10:00 PM',
      ],
      ['Last {{ date | weekday }} at {{ date | timeString }}', 'Last Friday at 10:00 PM'],
    ];

    it.each(cases)('.applyTokensToString(%s, tokens) => %s', (input, expected) => {
      expect(applyTokensToString(input, tokens as any)).toEqual(expected);
    });

    describe('Modifiers', () => {
      describe('weekday', () => {
        const cases = [
          ['{{ date | weekday }}', 'Friday'],
          ['{{ dateString | weekday }}', 'Friday'],
          ['{{ dateNumber | weekday }}', 'Friday'],
          ['{{ date | weekday("en-US") }}', 'Friday'],
          ['{{ date | weekday("fr-FR") }}', 'vendredi'],
          ['{{ date | weekday("fr-FR") | titleize }}', 'Vendredi'],
          ['{{ date | weekday("en-US", "long") }}', 'Friday'],
          ['{{ date | weekday("en-US", "short") }}', 'Fri'],
          ['{{ date | weekday("en-US", "narrow") }}', 'F'],
          ['{{ date | weekday("fr-FR", "narrow") }}', 'V'],
          ['{{ errorString | weekday("en-US") }}', ''],
        ];

        it.each(cases)('.applyTokensToString(%s, tokens) => %s', (input, expected) => {
          expect(applyTokensToString(input, tokens as any)).toEqual(expected);
        });
      });

      describe('timeString', () => {
        const cases = [
          ['{{ date | timeString }}', '10:00 PM'],
          ['{{ dateString | timeString }}', '10:00 PM'],
          ['{{ dateNumber | timeString }}', '10:00 PM'],
          ['{{ date | timeString("en-US") }}', '10:00 PM'],
          ['{{ date | timeString("el-GR") }}', '10:00 μ.μ.'],
          ['{{ date | timeString("el-GR") | titleize }}', '10:00 μ.μ.'],
          ['{{ date | timeString("fr-FR") }}', '22:00'],
          ['{{ errorString | timeString("en-US") }}', ''],
        ];

        it.each(cases)('.applyTokensToString(%s, tokens) => %s', (input, expected) => {
          expect(applyTokensToString(input, tokens as any)).toEqual(expected);
        });
      });

      describe('numeric', () => {
        const cases = [
          ['{{ date | numeric }}', '12/31/2021'],
          ['{{ dateString | numeric }}', '12/31/2021'],
          ['{{ dateNumber | numeric }}', '12/31/2021'],
          ['{{ date | numeric("en-US") }}', '12/31/2021'],
          ['{{ date | numeric("fr-FR") }}', '31/12/2021'],
          ['{{ date | numeric("fr-FR") | titleize }}', '31/12/2021'],
          ['{{ errorString | numeric("en-US") }}', ''],
        ];

        it.each(cases)('.applyTokensToString(%s, tokens) => %s', (input, expected) => {
          expect(applyTokensToString(input, tokens as any)).toEqual(expected);
        });
      });
    });
  });
});
