import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import { Command } from 'cmdk';
import { cx } from 'cva';
import * as React from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';

import { type CountryIso, IsoToCountryMap } from '~/constants/phone-number';
import { useFocusInput } from '~/hooks/use-focus-input';
import { useLocalizations } from '~/hooks/use-localizations';
import { Animated } from '~/primitives/animated';
import * as Field from '~/primitives/field';
import CheckmarkSm from '~/primitives/icons/checkmark-sm';
import ChevronUpDownSm from '~/primitives/icons/chevron-down-sm';
import { mergeRefs } from '~/utils/merge-refs';
import { extractDigits, formatPhoneNumber, parsePhoneString } from '~/utils/phone-number';

type UseFormattedPhoneNumberProps = {
  initPhoneWithCode: string;
  locationBasedCountryIso?: CountryIso | null;
};

const format = (str: string, iso: CountryIso) => {
  if (!str) {
    return '';
  }
  const country = IsoToCountryMap.get(iso);
  return formatPhoneNumber(str, country?.pattern, country?.code);
};

const useFormattedPhoneNumber = (props: UseFormattedPhoneNumberProps) => {
  const [number, setNumber] = React.useState(() => {
    const { number } = parsePhoneString(props.initPhoneWithCode || '');
    return number;
  });

  const [iso, setIso] = React.useState(
    parsePhoneString(props.initPhoneWithCode || '').number
      ? parsePhoneString(props.initPhoneWithCode || '').iso
      : props.locationBasedCountryIso || 'us',
  );

  React.useEffect(() => {
    setNumber(extractDigits(number));
  }, [iso, number]);

  const numberWithCode = React.useMemo(() => {
    if (!number) {
      return '';
    }
    const dialCode = IsoToCountryMap.get(iso)?.code || '1';
    return '+' + extractDigits(`${dialCode}${number}`);
  }, [iso, number]);

  const formattedNumber = React.useMemo(() => {
    return format(number, iso);
  }, [iso, number]);

  const setNumberAndIso = React.useCallback((str: string) => {
    const { iso, number } = parsePhoneString(str);
    setNumber(number);
    setIso(iso);
  }, []);

  return {
    setNumber,
    setIso,
    setNumberAndIso,
    iso,
    number,
    numberWithCode,
    formattedNumber,
  };
};

const countryOptions = Array.from(IsoToCountryMap.values()).map(country => {
  return {
    ...country,
  };
});

export const PhoneNumberField = React.forwardRef(function PhoneNumberField(
  {
    alternativeFieldTrigger,
    name = 'phoneNumber',
    initPhoneWithCode = '',
    onChange,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    alternativeFieldTrigger?: React.ReactNode;
    initPhoneWithCode?: string;
  },
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const clerk = useClerk();
  const locationBasedCountryIso = clerk.__internal_country as UseFormattedPhoneNumberProps['locationBasedCountryIso'];
  const { t, translateError } = useLocalizations();
  const [isOpen, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState(countryOptions[0]);
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const commandListRef = React.useRef<HTMLDivElement>(null);
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const contentWidth = containerRef.current?.getBoundingClientRect()?.width || 0;
  const [inputRef, setInputFocus] = useFocusInput();
  const { setNumber, setIso, setNumberAndIso, numberWithCode, formattedNumber, iso } = useFormattedPhoneNumber({
    initPhoneWithCode,
    locationBasedCountryIso,
  });

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const inputValue = e.clipboardData.getData('text');
    if (inputValue.includes('+')) {
      setNumberAndIso(inputValue);
    } else {
      setNumber(inputValue);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.includes('+')) {
      setNumberAndIso(inputValue);
    } else {
      setNumber(inputValue);
    }
  };

  React.useEffect(
    function syncSelectedCountry() {
      setSelectedCountry(countryOptions.find(c => c.iso === iso) || countryOptions[0]);
    },
    [iso],
  );

  React.useEffect(
    function scrollActiveCommandItemIntoView() {
      if (isOpen) {
        commandInputRef.current?.focus();
        setTimeout(() => {
          commandListRef.current?.querySelector('[data-checked=true]')?.scrollIntoView({ block: 'start' });
        }, 0);
      }
    },
    [isOpen],
  );

  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label htmlFor={id}>
            {t('formFieldLabel__phoneNumber')}{' '}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : !props?.required ? (
              <Field.Hint>{t('formFieldHintText__optional')}</Field.Hint>
            ) : null}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state: intent }) => {
            return (
              <div
                ref={containerRef}
                className={cx(
                  // Note:
                  // - To create the overlapping border/shadow effect"
                  //   - `ring` – "focus ring"
                  //   - `ring-offset` - border
                  'supports-ios:[--phone-number-field-py:theme(spacing.1)] [--phone-number-field-py:theme(spacing[1.5])]',
                  '[--phone-number-field-px:theme(spacing.3)]',
                  'ring ring-transparent ring-offset-1 ring-offset-[--cl-phone-number-field-border]',
                  'text-gray-12 relative flex min-w-0 rounded-md bg-white text-base outline-none',
                  'shadow-[0px_1px_1px_0px_theme(colors.gray.a3)]',
                  'has-[[data-field-input][disabled]]:cursor-not-allowed has-[[data-field-input][disabled]]:opacity-50',
                  // hover
                  'hover:has-[[data-field-input]:enabled]:ring-offset-[--cl-phone-number-field-border-active]',
                  // focus
                  'has-[[data-field-input]:focus-visible]:ring-offset-[--cl-phone-number-field-border-active]',
                  'has-[[data-field-input]:focus-visible]:ring-[--cl-phone-number-field-ring,theme(ringColor.light)]',
                  // intent
                  {
                    idle: [
                      '[--cl-phone-number-field-border:theme(colors.gray.a4)]',
                      '[--cl-phone-number-field-border-active:theme(colors.gray.a7)]',
                    ],
                    info: [
                      '[--cl-phone-number-field-border:theme(colors.gray.a7)]',
                      '[--cl-phone-number-field-border-active:theme(colors.gray.a7)]',
                    ],
                    error: [
                      '[--cl-phone-number-field-border:theme(colors.danger.DEFAULT)]',
                      '[--cl-phone-number-field-border-active:theme(colors.danger.DEFAULT)]',
                      '[--cl-phone-number-field-ring:theme(colors.danger.DEFAULT/0.2)]',
                    ],
                    success: [
                      '[--cl-phone-number-field-border:theme(colors.success.DEFAULT)]',
                      '[--cl-phone-number-field-border-active:theme(colors.success.DEFAULT)]',
                      '[--cl-phone-number-field-ring:theme(colors.success.DEFAULT/0.25)]', // (optically adjusted ring to 25 opacity)
                    ],
                    warning: [
                      '[--cl-phone-number-field-border:theme(colors.warning.DEFAULT)]',
                      '[--cl-phone-number-field-border-active:theme(colors.warning.DEFAULT)]',
                      '[--cl-phone-number-field-ring:theme(colors.warning.DEFAULT/0.2)]',
                    ],
                  }[intent],
                )}
              >
                <DialogTrigger>
                  <Button
                    onPress={() => setOpen(true)}
                    isDisabled={props.disabled}
                    className='hover:enabled:bg-gray-2 focus-visible:ring-light-opaque focus-visible:ring-offset-gray-8 relative flex items-center gap-x-1 rounded-s-md bg-white px-2 py-1 text-base outline-none focus-visible:ring focus-visible:ring-offset-1'
                  >
                    <span className='min-w-6 uppercase'>{selectedCountry.iso}</span>
                    <ChevronUpDownSm className='text-gray-9 size-4' />
                  </Button>
                  <Popover
                    isOpen={isOpen}
                    onOpenChange={setOpen}
                    placement='bottom start'
                    // Note: manual xOffset to ensure optical alignment
                    crossOffset={-1}
                  >
                    <Dialog
                      className='outline-none'
                      style={{
                        width: contentWidth,
                      }}
                    >
                      <Command className='border-gray-a3 overflow-hidden rounded-md border bg-white bg-clip-padding shadow-lg outline-none'>
                        <div className='p-0.5'>
                          <Command.Input
                            ref={commandInputRef}
                            placeholder='Search country or code'
                            className='leading-small bg-gray-2 placeholder:text-gray-9 text-gray-12 border-gray-4 supports-ios:py-1 supports-ios:text-[length:1rem] w-full rounded-[calc(theme(borderRadius.md)-2px)] border px-2 py-1.5 text-base outline-none'
                          />
                        </div>
                        <Command.List
                          ref={commandListRef}
                          className='max-h-[18vh] overflow-y-auto overflow-x-hidden'
                        >
                          <Command.Empty className='text-gray-11 leading-small px-4 py-1.5 text-center text-base'>
                            No countries found
                          </Command.Empty>
                          {countryOptions.map(({ name, iso, code }, index) => {
                            return (
                              <Command.Item
                                key={iso}
                                onSelect={() => {
                                  setIso(iso);
                                  setOpen(false);
                                  setInputFocus();
                                }}
                                data-checked={selectedCountry === countryOptions[index]}
                                className='leading-small aria-selected:bg-gray-2 flex cursor-pointer gap-x-2 px-4 py-1.5 text-base'
                              >
                                <span className='grid w-3 shrink-0 place-content-center'>
                                  {selectedCountry === countryOptions[index] && <CheckmarkSm className='size-4' />}
                                </span>
                                <span className='text-gray-12 grow truncate'>{name}</span>
                                <span className='text-gray-11 ms-auto'>+{code}</span>
                              </Command.Item>
                            );
                          })}
                        </Command.List>
                      </Command>
                    </Dialog>
                  </Popover>
                </DialogTrigger>
                <button
                  type='button'
                  // Prevent tab stop
                  tabIndex={-1}
                  className='supports-ios:text-[length:1rem] grid cursor-text place-content-center bg-white px-1 text-base'
                  onClick={() => setInputFocus()}
                  disabled={props.disabled}
                >
                  +{selectedCountry.code}
                </button>
                <Common.Input
                  value={numberWithCode}
                  className='hidden'
                />
                <input
                  ref={mergeRefs([forwardedRef, inputRef])}
                  type='tel'
                  id={id}
                  maxLength={25}
                  value={formattedNumber}
                  onPaste={handlePaste}
                  onChange={handlePhoneNumberChange}
                  {...props}
                  className='supports-ios:text-[length:1rem] w-full rounded-md bg-white px-[--phone-number-field-px] py-[--phone-number-field-py] text-base outline-none'
                  data-field-input
                />
              </div>
            );
          }}
        </Common.FieldState>
        <Animated>
          <Common.FieldError asChild>
            {({ message, code }) => {
              return (
                <Field.Message intent='error'>{translateError({ message, code, name: 'phone_number' })}</Field.Message>
              );
            }}
          </Common.FieldError>
        </Animated>
      </Field.Root>
    </Common.Field>
  );
});
