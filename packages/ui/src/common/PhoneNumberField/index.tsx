import * as Common from '@clerk/elements/common';
import cn from 'clsx';
import { Command } from 'cmdk';
import * as React from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';

import * as Field from '~/primitives/field';
import * as Icon from '~/primitives/icon';

import { type CountryIso, IsoToCountryMap } from './data';
import { useFormattedPhoneNumber } from './useFormattedPhoneNumber';

const countryOptions = Array.from(IsoToCountryMap.values()).map(country => {
  return {
    ...country,
  };
});

export function PhoneNumberField({
  onChange,
  locationBasedCountryIso,
}: {
  locationBasedCountryIso: CountryIso;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [selectedCountry, setSelectedCountry] = React.useState(countryOptions[0]);
  const [isOpen, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const commandListRef = React.useRef<HTMLDivElement>(null);
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const contentWidth = containerRef.current?.clientWidth || 0;
  const { setNumber, setIso, setNumberAndIso, numberWithCode, formattedNumber, iso } = useFormattedPhoneNumber({
    initPhoneWithCode: selectedCountry.iso,
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
      setNumberAndIso(inputValue);
      setSelectedCountry(countryOptions.find(c => c.iso === iso) || countryOptions[0]);
    } else {
      setNumber(inputValue);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.includes('+')) {
      setNumberAndIso(inputValue);
      setSelectedCountry(countryOptions.find(c => c.iso === iso) || countryOptions[0]);
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
      name='phoneNumber'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>Phone number</Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state: intent }) => {
            return (
              <div
                ref={containerRef}
                className={cn(
                  'flex w-full bg-white text-gray-12 rounded-md bg-clip-padding border border-gray-a6 outline-none text-base',
                  'focus-within:ring-[0.1875rem] disabled:opacity-50 disabled:cursor-not-allowed',
                  // intent
                  {
                    idle: 'hover:border-gray-a8 focus-within:ring-gray-a3 focus-within:border-gray-a8',
                    info: 'hover:border-gray-a8 focus-within:ring-gray-a3 focus-within:border-gray-a8',
                    error: 'border-danger focus-within:ring-danger/20',
                    success: 'border-success focus-within:ring-success/25', // (optically adjusted ring to 25 opacity)
                    warning: 'border-warning focus-within:ring-warning/20',
                  }[intent],
                  // data-[invalid] overrides all
                  'data-[invalid]:border-danger data-[invalid]:hover:border-danger data-[invalid]:focus-within:border-danger data-[invalid]:focus-within:ring-danger/30',
                )}
              >
                <DialogTrigger>
                  <Button
                    onPress={() => setOpen(true)}
                    className='hover:bg-gray-2 focus-visible:bg-gray-2 py-1 px-2 gap-x-2 flex items-center rounded-l-md outline-none text-base'
                  >
                    <span className='uppercase min-w-6'>{selectedCountry.iso}</span>
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
                      <Command className='bg-white bg-clip-padding border border-gray-a3 rounded-md shadow-lg outline-none overflow-hidden'>
                        <div className='p-0.5'>
                          <Command.Input
                            ref={commandInputRef}
                            placeholder='Search country or code'
                            className='py-1.5 px-2 w-full text-base leading-small bg-gray-2 outline-none placeholder:text-gray-9 rounded-[calc(theme(borderRadius.md)-2px)] text-gray-12 border border-gray-4'
                          />
                        </div>
                        <Command.List
                          ref={commandListRef}
                          className='overflow-y-auto overflow-x-hidden max-h-80'
                        >
                          <Command.Empty className='text-gray-11 text-base leading-small text-center py-1.5 px-4'>
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
                                className='py-1.5 px-4 flex gap-x-2 text-base leading-small cursor-pointer aria-selected:bg-gray-2'
                              >
                                <span className='shrink-0 w-3 grid place-content-center'>
                                  {selectedCountry === countryOptions[index] && <Icon.Checkmark className='w-3' />}
                                </span>
                                <span className='truncate grow'>{name}</span>
                                <span className='ms-auto text-gray-11'>+{code}</span>
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
                  className='grid place-content-center px-1 cursor-text text-base'
                  onClick={() => inputRef.current?.focus()}
                >
                  +{selectedCountry.code}
                </button>
                <Common.Input
                  ref={inputRef}
                  type='telephone'
                  maxLength={25}
                  value={formattedNumber}
                  onPaste={handlePaste}
                  onChange={handlePhoneNumberChange}
                  className='w-full bg-white py-1.5 pr-2.5 text-base rounded-r-md outline-none'
                />
              </div>
            );
          }}
        </Common.FieldState>
      </Field.Root>
    </Common.Field>
  );
}
