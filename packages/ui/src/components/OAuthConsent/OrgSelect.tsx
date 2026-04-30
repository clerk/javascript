import { useRef } from 'react';

import { Image, Text } from '@/ui/customizables';
import { Select, SelectButton, SelectOption, SelectOptionList } from '@/ui/elements/Select';

export type OrgOption = {
  value: string;
  label: string;
  logoUrl: string;
};

type OrgSelectProps = {
  options: OrgOption[];
  value: string | null;
  onChange: (value: string) => void;
};

export function OrgSelect({ options, value, onChange }: OrgSelectProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find(option => option.value === value);

  return (
    <Select
      options={options}
      value={value}
      onChange={option => onChange(option.value)}
      referenceElement={buttonRef}
      renderOption={(option, _index, isSelected) => (
        <SelectOption isSelected={isSelected}>
          <SelectOption.Image
            src={option.logoUrl}
            alt={option.label}
          />
          <SelectOption.Label>{option.label}</SelectOption.Label>
        </SelectOption>
      )}
    >
      <SelectButton
        ref={buttonRef}
        aria-haspopup='listbox'
        sx={theme => ({
          paddingInline: theme.space.$3,
        })}
      >
        <Image
          src={selected?.logoUrl || ''}
          alt={selected?.label || ''}
          sx={theme => ({
            width: theme.sizes.$5,
            height: theme.sizes.$5,
            borderRadius: theme.radii.$md,
            objectFit: 'contain',
            flexShrink: 0,
          })}
        />
        <Text
          colorScheme='body'
          as='span'
          truncate
          sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}
        >
          {selected?.label || 'Select an option'}
        </Text>
      </SelectButton>
      <SelectOptionList />
    </Select>
  );
}
