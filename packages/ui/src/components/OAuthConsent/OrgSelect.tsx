import { useRef } from 'react';

import { Box, Icon, Image, localizationKeys, Text } from '@/ui/customizables';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Checkmark } from '@/ui/icons';
import type { PropsOfComponent } from '@/ui/styledSystem';
import { common } from '@/ui/styledSystem';

export type OrgOption = {
  value: string;
  label: string;
  logoUrl: string;
  disabled?: boolean;
};

type OrgSelectProps =
  | {
      multiple?: false;
      options: OrgOption[];
      value: string | null;
      onChange: (value: string) => void;
    }
  | {
      multiple: true;
      options: OrgOption[];
      value: string[];
      onChange: (value: string[]) => void;
    };

export function OrgSelect(props: OrgSelectProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { options } = props;

  if (props.multiple) {
    const { value, onChange } = props;
    const [first] = value;
    const selected = value.length === 1 ? options.find(option => option.value === first) : undefined;

    return (
      <Select
        multiple
        options={options}
        value={value}
        onChange={onChange}
        referenceElement={buttonRef}
        renderOption={renderOrgOption}
      >
        <OrgSelectButton buttonRef={buttonRef}>
          {selected ? (
            <OrgSelectLabel>{selected.label}</OrgSelectLabel>
          ) : (
            <OrgSelectLabel
              localizationKey={
                value.length > 1
                  ? localizationKeys('oauthConsent.organizationSelect.selectedCount', { count: value.length })
                  : localizationKeys('oauthConsent.organizationSelect.placeholder')
              }
            />
          )}
        </OrgSelectButton>
        <SelectOptionList />
      </Select>
    );
  }

  const { value, onChange } = props;
  const selected = options.find(option => option.value === value);

  return (
    <Select
      options={options}
      value={value}
      onChange={option => onChange(option.value)}
      referenceElement={buttonRef}
      renderOption={renderOrgOption}
    >
      <OrgSelectButton buttonRef={buttonRef}>
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
        <OrgSelectLabel>{selected?.label || 'Select an option'}</OrgSelectLabel>
      </OrgSelectButton>
      <SelectOptionList />
    </Select>
  );
}

function OrgSelectButton({
  buttonRef,
  children,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  return (
    <SelectButton
      ref={buttonRef}
      aria-haspopup='listbox'
      sx={theme => ({
        paddingInline: theme.space.$3,
      })}
    >
      {children}
    </SelectButton>
  );
}

function OrgSelectLabel(props: PropsOfComponent<typeof Text>) {
  return (
    <Text
      colorScheme='body'
      as='span'
      truncate
      sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}
      {...props}
    />
  );
}

function renderOrgOption(option: OrgOption, _index?: number, isSelected?: boolean) {
  return (
    <Box
      as='span'
      sx={theme => ({
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `${theme.sizes.$5} 1fr ${theme.sizes.$3}`,
        columnGap: theme.space.$2,
        paddingInlineStart: theme.space.$1,
        paddingInlineEnd: theme.space.$1x5,
        paddingBlock: theme.space.$1,
        alignItems: 'center',
        borderRadius: theme.radii.$md,
        '&:hover, &[data-focused="true"]': {
          background: common.mutedBackground(theme),
        },
        '&[data-disabled="true"]': {
          background: 'none',
          opacity: theme.opacity.$disabled,
        },
      })}
    >
      <Image
        src={option.logoUrl}
        alt={option.label}
        sx={theme => ({
          width: theme.sizes.$5,
          height: theme.sizes.$5,
          objectFit: 'contain',
          flexShrink: 0,
          borderRadius: theme.radii.$md,
        })}
      />
      <Text
        sx={{ flex: 1, textAlign: 'start', minWidth: 0, maxInlineSize: '200px' }}
        truncate
        as='span'
        variant='subtitle'
      >
        {option.label}
      </Text>
      {isSelected && (
        <Icon
          icon={Checkmark}
          sx={theme => ({ color: theme.colors.$primary500 })}
        />
      )}
    </Box>
  );
}
