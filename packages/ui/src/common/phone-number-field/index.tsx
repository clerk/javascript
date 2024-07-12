import * as Common from '@clerk/elements/common';
import { Command } from 'cmdk';
import { cx } from 'cva';
import * as React from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';

import * as Field from '~/primitives/field';
import * as Icon from '~/primitives/icon';
import { mergeRefs } from '~/utils/merge-refs';

import { type CountryIso, IsoToCountryMap } from './data';
import { useFormattedPhoneNumber } from './useFormattedPhoneNumber';
import { parsePhoneString } from './utils';

const countryOptions = Array.from(IsoToCountryMap.values()).map(country => {
  return {
    ...country,
  };
});

export const PhoneNumberField = React.forwardRef(function PhoneNumberField(
  {
    alternativeFieldTrigger,
    label = 'Phone number',
    name = 'phoneNumber',
    hintText = 'Optional',
    initPhoneWithCode = '',
    locationBasedCountryIso,
    onChange,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    alternativeFieldTrigger?: React.ReactNode;
    label?: React.ReactNode;
    hintText?: string;
    initPhoneWithCode?: string;
    locationBasedCountryIso: CountryIso;
  },
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const [selectedCountry, setSelectedCountry] = React.useState(countryOptions[0]);
  const [isOpen, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const commandListRef = React.useRef<HTMLDivElement>(null);
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const contentWidth = containerRef.current?.clientWidth || 0;
  const { setNumber, setIso, setNumberAndIso, numberWithCode, formattedNumber } = useFormattedPhoneNumber({
    initPhoneWithCode,
    locationBasedCountryIso,
  });

  const callOnChangeProp = () => {
    // Quick and dirty way to match this component's public API
    // with every other Input component, so we can use the same helpers
    // without worrying about the underlying implementation details
    onChange?.({ target: { value: numberWithCode } } as any);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const inputValue = e.clipboardData.getData('text');
    if (inputValue.includes('+')) {
      const { iso: newIso } = parsePhoneString(inputValue);
      setNumberAndIso(inputValue);
      setSelectedCountry(countryOptions.find(c => c.iso === newIso) || countryOptions[0]);
    } else {
      setNumber(inputValue);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.includes('+')) {
      const { iso: newIso } = parsePhoneString(inputValue);
      setNumberAndIso(inputValue);
      setSelectedCountry(countryOptions.find(c => c.iso === newIso) || countryOptions[0]);
    } else {
      setNumber(inputValue);
    }
  };

  React.useEffect(callOnChangeProp, [numberWithCode, onChange]);
  React.useEffect(() => {
    if (isOpen) {
      commandInputRef.current?.focus();
      setTimeout(() => {
        commandListRef.current?.querySelector('[data-checked=true]')?.scrollIntoView({ block: 'start' });
      }, 0);
    }
  }, [isOpen]);

  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {label}{' '}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : !props?.required ? (
              <Field.Hint>{hintText}</Field.Hint>
            ) : null}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state: intent }) => {
            return (
              <div
                ref={containerRef}
                className={cx(
                  'text-gray-12 border-gray-a6 flex w-full rounded-md border bg-white bg-clip-padding text-base outline-none',
                  'focus-within:ring-[0.1875rem] has-[[data-field-input][disabled]]:cursor-not-allowed has-[[data-field-input][disabled]]:opacity-50',
                  // intent
                  {
                    idle: 'hover:border-gray-a8 focus-within:ring-gray-a3 focus-within:border-gray-a8',
                    info: 'hover:border-gray-a8 focus-within:ring-gray-a3 focus-within:border-gray-a8',
                    error: 'border-danger focus-within:ring-danger/20',
                    success: 'border-success focus-within:ring-success/25', // (optically adjusted ring to 25 opacity)
                    warning: 'border-warning focus-within:ring-warning/20',
                  }[intent],
                  // data-[invalid] overrides all
                  'has-[[data-field-input][invalid]]:border-danger has-[[data-field-input][invalid]]:hover:border-danger has-[[data-field-input][invalid]]:focus-within:border-danger has-[[data-field-input][invalid]]:focus-within:ring-danger/30',
                )}
              >
                <DialogTrigger>
                  <Button
                    onPress={() => setOpen(true)}
                    isDisabled={props.disabled}
                    className='hover:enabled:bg-gray-2 focus-visible:bg-gray-2 flex items-center gap-x-2 rounded-l-md px-2 py-1 text-base outline-none'
                  >
                    <span className='min-w-6 uppercase'>{selectedCountry.iso}</span>
                    <Icon.ChevronUpDown className='text-gray-11 size-4' />
                  </Button>
                  <Popover
                    isOpen={isOpen}
                    onOpenChange={setOpen}
                    placement='bottom start'
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
                            className='leading-small bg-gray-2 placeholder:text-gray-9 text-gray-12 border-gray-4 w-full rounded-[calc(theme(borderRadius.md)-2px)] border px-2 py-1.5 text-base outline-none'
                          />
                        </div>
                        <Command.List
                          ref={commandListRef}
                          className='max-h-80 overflow-y-auto overflow-x-hidden'
                        >
                          <Command.Empty className='text-gray-11 leading-small px-4 py-1.5 text-center text-base'>
                            No countries found
                          </Command.Empty>
                          {countryOptions.map(({ name, iso, code }, index) => {
                            return (
                              <Command.Item
                                key={iso}
                                onSelect={() => {
                                  setSelectedCountry(countryOptions[index]);
                                  setIso(iso);
                                  setOpen(false);
                                }}
                                data-checked={selectedCountry === countryOptions[index]}
                                className='leading-small aria-selected:bg-gray-2 flex cursor-pointer gap-x-2 px-4 py-1.5 text-base'
                              >
                                <span className='grid w-3 shrink-0 place-content-center'>
                                  {selectedCountry === countryOptions[index] && <Icon.Checkmark className='w-3' />}
                                </span>
                                <span className='grow truncate'>{name}</span>
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
                  maxLength={25}
                  value={formattedNumber}
                  onPaste={handlePaste}
                  onChange={handlePhoneNumberChange}
                  {...props}
                  className='w-full rounded-r-md bg-white py-1.5 pr-2.5 text-base outline-none'
                  data-field-input
                />
              </div>
            );
          }}
        </Common.FieldState>
      </Field.Root>
    </Common.Field>
  );
});
