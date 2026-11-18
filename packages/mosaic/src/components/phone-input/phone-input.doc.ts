import type { ComponentDoc } from '../../docs-schema';
import type { PhoneInputProps } from './phone-input';

export default {
  name: 'PhoneInput',
  description:
    'A phone number input with a searchable country picker. Formats the national number as the user types and reports the value in E.164, such as `+14155550123`. Typing a number that starts with `+` picks the country from it.',
  useFor: ['a phone number field', 'a phone number with a country code picker'],
  keywords: ['phone', 'phone number', 'tel', 'country code', 'e164', 'sms'],
  practices: [
    { do: true, text: 'Read and write `value` as E.164. The input formats it for display.' },
    {
      do: true,
      text: 'Pass `country` as well as `value` when calling codes are ambiguous, such as `+1`, and the country is known.',
    },
    { do: true, text: 'Pass `name` in a plain `<form>`. A hidden input submits the E.164 value.' },
    { do: true, text: 'Pass localized strings for the country labels, placeholder and empty message.' },
  ],
  parts: {
    PhoneInput: {
      description:
        'An `InputGroup` with the country trigger, the calling code prefix and the number input. The ref and `Field` wiring go to the number input.',
      slot: 'cl-phone-input',
      props: {
        value: { type: 'string', doc: 'The E.164 value, when controlled.' },
        defaultValue: { type: 'string', doc: 'The E.164 value on mount, when uncontrolled.', default: "''" },
        onValueChange: {
          type: '(value: string) => void',
          doc: 'Called with the E.164 value when the number or country changes.',
        },
        country: { type: 'CountryIso', doc: 'The selected country, when controlled.' },
        defaultCountry: {
          type: 'CountryIso',
          doc: 'The country when neither `country` nor the value picks one.',
          default: "'us'",
        },
        onCountryChange: { type: '(country: CountryIso) => void', doc: 'Called with the new country.' },
        size: { type: "'sm' | 'md' | 'lg'", doc: '`sm`, `md` or `lg`.', default: "'md'" },
        countryTriggerLabel: { type: 'string', doc: 'The country trigger name, with `{country}` filled in.' },
        countryPopupLabel: { type: 'string', doc: 'The country popup name.' },
        countrySearchLabel: { type: 'string', doc: 'The country search input name.' },
        countrySearchPlaceholder: { type: 'string', doc: 'The country search placeholder.', default: "'Search'" },
        noResultsMessage: {
          type: 'string',
          doc: 'Shown when no country matches the search.',
          default: "'No countries found'",
        },
        name: { type: 'string', doc: 'Submits the E.164 value under this name through a hidden input.' },
        autoComplete: {
          type: 'string',
          doc: 'Passed to the number input.',
          default: "'tel-national'",
        },
      },
    },
  },
  examples: [
    {
      title: 'A phone field',
      code: `
<Field.Root>
  <Field.Label>Phone number</Field.Label>
  <PhoneInput
    value={phone}
    onValueChange={setPhone}
    countryTriggerLabel='Country: {country}'
    countryPopupLabel='Countries'
    countrySearchLabel='Search countries'
  />
</Field.Root>
`,
    },
  ],
  related: ['Input', 'InputGroup', 'Field'],
} satisfies ComponentDoc<{ PhoneInput: PhoneInputProps }>;
