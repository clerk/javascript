import { Box, Icon, Image, Text } from '@/ui/customizables';
import { OrganizationAvatar } from '@/ui/elements/OrganizationAvatar';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Checkmark } from '@/ui/icons';
import { common } from '@/ui/styledSystem';

export type OrgOption = {
  value: string;
  label: string;
  logoUrl?: string;
};

type OrgSelectProps = {
  id?: string;
  options: OrgOption[];
  value: string | null;
  onChange: (value: string) => void;
};

export function OrgSelect({ id, options, value, onChange }: OrgSelectProps) {
  const selected = options.find(option => option.value === value);

  return (
    <Select
      options={options}
      value={value}
      onChange={option => onChange(option.value)}
      renderOption={(option, _index, isSelected) => (
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
          })}
        >
          {option.logoUrl ? (
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
          ) : (
            <OrganizationAvatar
              name={option.label}
              size={theme => theme.sizes.$5}
            />
          )}
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
      )}
    >
      <SelectButton
        id={id}
        aria-haspopup='listbox'
        sx={theme => ({
          paddingInline: theme.space.$3,
        })}
      >
        {selected?.logoUrl ? (
          <Image
            src={selected.logoUrl}
            alt={selected.label}
            sx={theme => ({
              width: theme.sizes.$5,
              height: theme.sizes.$5,
              borderRadius: theme.radii.$md,
              objectFit: 'contain',
              flexShrink: 0,
            })}
          />
        ) : (
          <OrganizationAvatar
            name={selected?.label}
            size={theme => theme.sizes.$5}
          />
        )}
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
