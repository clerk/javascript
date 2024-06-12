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
      className='grid grid-cols-2 rounded border'
    >
      {items.map(item => {
        return (
          <RadixToggleGroup.Item
            key={item.value}
            value={item.value}
            className='p-1.5 text-xs font-medium data-[state="on"]:bg-neutral-100'
          >
            {item.label}
          </RadixToggleGroup.Item>
        );
      })}
    </RadixToggleGroup.Root>
  );
}
