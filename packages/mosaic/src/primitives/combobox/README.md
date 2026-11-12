# Combobox

A headless single-selection input. Typing searches options; choosing one remembers its value.

```tsx
import { Combobox } from '../../primitives/combobox';

<Combobox.Root>
  <Combobox.Input aria-label='Fruit' />
  <Combobox.Trigger aria-label='Show fruits' />
  <Combobox.Positioner>
    <Combobox.Popup>
      <Combobox.Collection
        items={['Apple', 'Banana']}
        itemToStringLabel={item => item}
      >
        {item => (
          <Combobox.Option
            key={item}
            value={item}
          >
            {item}
            <Combobox.OptionIndicator>✓</Combobox.OptionIndicator>
          </Combobox.Option>
        )}
      </Combobox.Collection>
    </Combobox.Popup>
  </Combobox.Positioner>
</Combobox.Root>;
```

`value`, `defaultValue`, and `onValueChange` control the selected option. Clearing the input clears selection with `null`. `inputValue`, `defaultInputValue`, and `onInputValueChange` control search text separately. `disabled` disables the input, trigger, Clear and chip remove buttons, marks options and chips `aria-disabled`, and ignores every change to the selection. With `focusableWhenDisabled`, the input becomes read-only and the input and buttons stay focusable, marked `aria-disabled`. The popup positions against `Chips` when it is rendered, otherwise against the input; `Positioner`'s `anchor` overrides both.

Dismissal restores the selected label. Reopening shows all options until typing starts. Hover and keyboard highlighting do not change selection.

For search inside another popup, use `inline` with `List` and bind `open` to the outer popup. Closing clears search without clearing selection. Supply `defaultInputValue` when an initial selection's label differs from its value.

Combobox owns its selection state and rendering parts independently of Autocomplete. Both use general headless utilities for rendering, controllable state, and transitions. Mosaic adds styling separately.
