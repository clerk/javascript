import type { SelectItem } from '@clerk/headless/select';

import { ChevronDown } from '../../icons';
import { Box } from './box';
import { Select } from './select';
import { Text } from './text';

const NONE = '_none';
const NONE_ITEM: SelectItem = { value: NONE, label: 'Any' };

interface FilterChipProps {
  label: string;
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  items: SelectItem[];
  /** When false, the chip always shows in the selected (solid) style and omits the "Any" clear option. Defaults to true. */
  clearable?: boolean;
}

export function FilterChip({ label, value, onValueChange, items, clearable = true }: FilterChipProps) {
  const hasValue = value !== undefined;
  const selectedLabel = items.find(i => i.value === value)?.label ?? value;
  const selectValue = value ?? (clearable ? NONE : (items[0]?.value ?? NONE));
  const allItems = clearable ? [NONE_ITEM, ...items] : items;
  const showSelected = hasValue || !clearable;

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue === NONE ? undefined : newValue);
  };

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
      items={allItems}
      placement='bottom-start'
      sideOffset={4}
      trigger={p => (
        <Box
          render={pp => <button {...pp} />}
          {...(p as object)}
          sx={t => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: t.spacing(1),
            height: '24px',
            paddingInline: t.spacing(2),
            borderRadius: t.rounded.md,
            border: showSelected ? `1px solid ${t.color.border}` : `1px dashed ${t.color.border}`,
            background: showSelected ? `light-dark(white, oklch(0.2 0 0))` : t.color.muted,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            '&:hover': { borderColor: '#DBDBE0' },
          })}
        >
          {showSelected ? (
            <>
              <Text
                size='xs'
                intent='mutedForeground'
                render={p => <span {...p} />}
                sx={t => ({ fontWeight: t.font.medium })}
              >
                {label}:
              </Text>
              <Text
                size='xs'
                sx={t => ({ fontWeight: t.font.medium })}
                render={p => <span {...p} />}
              >
                {selectedLabel ?? items[0]?.label}
              </Text>
            </>
          ) : (
            <Text
              size='xs'
              render={p => <span {...p} />}
              sx={t => ({ fontWeight: t.font.medium })}
            >
              {label}
            </Text>
          )}
          <ChevronDown
            height={16}
            style={{ opacity: 0.6, flexShrink: 0 }}
          />
        </Box>
      )}
    >
      {allItems.map(item => (
        <Select.Option
          key={item.value}
          value={item.value}
          label={item.label}
        >
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
}
