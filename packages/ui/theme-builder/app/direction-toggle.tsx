import type { ToggleGroupSingleProps } from '@radix-ui/react-toggle-group';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

export function DirectionToggle({
  items,
  value,
  onValueChange,
}: Pick<ToggleGroupSingleProps, 'value' | 'onValueChange'> & {
  items: { label: string; value: string }[];
}) {
  return (
    <ToggleGroup.Root
      type='single'
      value={value}
      onValueChange={v => {
        if (v) {
          onValueChange?.(v);
        }
      }}
      className='grid grid-cols-2 border rounded'
    >
      {items.map(item => {
        return (
          <ToggleGroup.Item
            key={item.value}
            value={item.value}
            className='font-medium text-xs data-[state="on"]:bg-neutral-100 p-1.5'
          >
            {item.label}
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
}
