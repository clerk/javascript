import type { ToggleGroupSingleProps } from '@radix-ui/react-toggle-group';
import * as RadixToggleGroup from '@radix-ui/react-toggle-group';

export function ToggleGroup({
  items,
  value,
  onValueChange,
}: Pick<ToggleGroupSingleProps, 'value' | 'onValueChange'> & {
  items: { label: string; value: string }[];
}) {
  return (
    <RadixToggleGroup.Root
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
          <RadixToggleGroup.Item
            key={item.value}
            value={item.value}
            className='font-medium text-xs data-[state="on"]:bg-neutral-100 p-1.5'
          >
            {item.label}
          </RadixToggleGroup.Item>
        );
      })}
    </RadixToggleGroup.Root>
  );
}
