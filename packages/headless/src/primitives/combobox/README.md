# Combobox

A headless single-selection input. Typing searches options; choosing one remembers its value.

```tsx
import { Combobox } from '@clerk/headless/combobox';

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

`value`, `defaultValue`, and `onValueChange` control the selected option. Clearing the input clears selection with `null`. `inputValue`, `defaultInputValue`, and `onInputValueChange` control search text separately.

Dismissal restores the selected label. Reopening shows all options until typing starts. Hover and keyboard highlighting do not change selection.

For search inside another popup, use `inline` with `List` and bind `open` to the outer popup. Closing clears search without clearing selection. Supply `defaultInputValue` when an initial selection's label differs from its value.

Combobox reuses Autocomplete's rendering and keyboard internals. Autocomplete's existing public props and free-text behavior remain unchanged. Mosaic adds styling separately.
