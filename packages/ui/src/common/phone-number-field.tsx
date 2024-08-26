import { useClerk } from '@clerk/clerk-react';
import * as Common from '@clerk/elements/common';
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { cx } from 'cva';
import * as React from 'react';

import { type CountryIso, IsoToCountryMap } from '~/constants/phone-number';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Field from '~/primitives/field';
import * as Icon from '~/primitives/icon';
import { commandScore } from '~/utils/command-score';
import { mergeRefs } from '~/utils/merge-refs';
import { extractDigits, formatPhoneNumber, parsePhoneString } from '~/utils/phone-number';

type UseFormattedPhoneNumberProps = {
  initPhoneWithCode: string;
  locationBasedCountryIso?: CountryIso;
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
  // TODO to fix IsomorphicClerk
  const locationBasedCountryIso = (clerk as any)?.clerkjs.__internal_country;
  const { t, translateError } = useLocalizations();
  const [isOpen, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState(countryOptions[0]);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);
  const contentWidth = containerRef.current?.getBoundingClientRect()?.width || 0;
  const { setNumber, setIso, setNumberAndIso, numberWithCode, formattedNumber, iso } = useFormattedPhoneNumber({
    initPhoneWithCode,
    locationBasedCountryIso,
  });

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isOpen,
    onOpenChange: setOpen,
    middleware: [offset(5), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, dismiss, role, listNavigation]);

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

  const filteredOptions = countryOptions
    .map(option => ({
      ...option,
      score: commandScore(option.name, inputValue, [option.code]),
    }))
    .filter(option => option.score > 0)
    .sort((a, b) => b.score - a.score);

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
                  '[--phone-number-field-py:theme(spacing[1.5])]',
                  '[--phone-number-field-px:theme(spacing.3)]',
                  'ring ring-transparent ring-offset-1 ring-offset-[--cl-phone-number-field-border]',
                  'text-gray-12 relative flex min-w-0 rounded-md bg-white text-base outline-none',
                  'shadow-[0px_1px_1px_0px_theme(colors.gray.a3)]',
                  'has-[[data-field-input][disabled]]:cursor-not-allowed has-[[data-field-input][disabled]]:opacity-50',
                  'hover:has-[[data-field-input]:enabled]:ring-offset-[--cl-phone-number-field-border-active]',
                  'has-[[data-field-input]:focus-visible]:ring-offset-[--cl-phone-number-field-border-active]',
                  'has-[[data-field-input]:focus-visible]:ring-[--cl-phone-number-field-ring,theme(ringColor.light)]',
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
                      '[--cl-phone-number-field-ring:theme(colors.success.DEFAULT/0.25)]',
                    ],
                    warning: [
                      '[--cl-phone-number-field-border:theme(colors.warning.DEFAULT)]',
                      '[--cl-phone-number-field-border-active:theme(colors.warning.DEFAULT)]',
                      '[--cl-phone-number-field-ring:theme(colors.warning.DEFAULT/0.2)]',
                    ],
                  }[intent],
                )}
              >
                <button
                  ref={refs.setReference}
                  {...getReferenceProps()}
                  disabled={props.disabled}
                  type='button'
                  className='hover:enabled:bg-gray-2 focus-visible:ring-light-opaque focus-visible:ring-offset-gray-8 flex items-center gap-x-1 rounded-l-md px-2 py-1 text-base outline-none focus-visible:ring focus-visible:ring-offset-1'
                >
                  <span className='min-w-6 uppercase'>{selectedCountry.iso}</span>
                  <Icon.ChevronUpDownSm className='text-gray-9 text-[length:theme(size.4)]' />
                </button>
                <FloatingPortal>
                  {isOpen && (
                    <FloatingFocusManager
                      context={context}
                      modal={false}
                    >
                      <div
                        ref={refs.setFloating}
                        style={{ ...floatingStyles, width: contentWidth }}
                        {...getFloatingProps()}
                        className='border-gray-a3 overflow-hidden rounded-md border bg-white bg-clip-padding shadow-lg outline-none'
                      >
                        <div className='p-0.5'>
                          <input
                            placeholder='Search country or code'
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            className='leading-small bg-gray-2 placeholder:text-gray-9 text-gray-12 border-gray-4 w-full rounded-[calc(theme(borderRadius.md)-2px)] border px-2 py-1.5 text-base outline-none'
                          />
                        </div>
                        <div className='max-h-80 overflow-y-auto overflow-x-hidden'>
                          {filteredOptions.length === 0 ? (
                            <div className='text-gray-11 leading-small px-4 py-1.5 text-center text-base'>
                              No countries found
                            </div>
                          ) : (
                            filteredOptions.map(({ name, iso, code }, index) => (
                              <div
                                key={iso}
                                ref={node => {
                                  listRef.current[index] = node;
                                }}
                                {...getItemProps({
                                  onClick: () => {
                                    setIso(iso);
                                    setOpen(false);
                                  },
                                })}
                                className={cx(
                                  'leading-small flex cursor-pointer gap-x-2 px-4 py-1.5 text-base',
                                  activeIndex === index && 'bg-gray-2',
                                )}
                              >
                                <span className='grid w-3 shrink-0 place-content-center'>
                                  {selectedCountry.iso === iso && (
                                    <Icon.CheckmarkSm className='text-[length:theme(size.4)]' />
                                  )}
                                </span>
                                <span className='grow truncate'>{name}</span>
                                <span className='text-gray-11 ms-auto'>+{code}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </FloatingFocusManager>
                  )}
                </FloatingPortal>
                <button
                  type='button'
                  // Prevent tab stop
                  tabIndex={-1}
                  className='grid cursor-text place-content-center px-1 text-base'
                  onClick={() => inputRef.current?.focus()}
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
                  className='w-full rounded-r-md bg-white py-[--phone-number-field-py] pr-[--phone-number-field-px] text-base outline-none'
                  data-field-input
                />
              </div>
            );
          }}
        </Common.FieldState>
        <Common.FieldError asChild>
          {({ message, code }) => {
            return (
              <Field.Message intent='error'>{translateError({ message, code, name: 'phone_number' })}</Field.Message>
            );
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
});
