import { useRef } from 'react';

import { InfiniteListSpinner } from '@/ui/common/InfiniteListSpinner';
import { Box, Icon, Image, Text } from '@/ui/customizables';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { useInView } from '@/ui/hooks/useInView';
import { Check } from '@/ui/icons';
import { common } from '@/ui/styledSystem';

export type OrgOption = {
  value: string;
  label: string;
  logoUrl: string;
};

type OrgSelectProps = {
  options: OrgOption[];
  value: string | null;
  onChange: (value: string) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

export function OrgSelect({ options, value, onChange, hasMore, onLoadMore }: OrgSelectProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find(option => option.value === value);
  const { ref: loadMoreRef } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView && hasMore) {
        onLoadMore?.();
      }
    },
  });

  return (
    <Select
      options={options}
      value={value}
      onChange={option => onChange(option.value)}
      referenceElement={buttonRef}
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
              size='sm'
              sx={theme => ({ color: theme.colors.$primary500 })}
            />
          )}
        </Box>
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
      <SelectOptionList
        footer={hasMore ? <InfiniteListSpinner ref={loadMoreRef} /> : null}
        onReachEnd={hasMore ? onLoadMore : undefined}
      />
    </Select>
  );
}
