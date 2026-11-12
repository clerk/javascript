# Combobox

A headless single-selection input. Typing searches options; choosing one remembers its value.

```tsx
import { Combobox } from '../../primitives/combobox';

<Combobox.Root
  items={['Apple', 'Banana']}
  itemToStringLabel={item => item}
>
  <Combobox.Input aria-label='Fruit' />
  <Combobox.Trigger aria-label='Show fruits' />
  <Combobox.Positioner>
    <Combobox.Popup>
      <Combobox.Empty>No fruit found</Combobox.Empty>
      <Combobox.Collection>
        {(item: string) => (
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

`items` and `itemToStringLabel` on `Root` give the options to search. `Collection` renders the ones whose label contains the search text, case-insensitively. Annotate its `children` parameter with the item type. `Empty` is a polite `role="status"` region that shows its children only when nothing matches. Keep it mounted, so screen readers announce the message when it appears. Without `items`, it always shows its children.

Dismissal restores the selected label. Reopening shows all options until typing starts. Hover and keyboard highlighting do not change selection.

For search inside another popup, use `inline` with `List` and bind `open` to the outer popup. Closing clears search without clearing selection. Supply `defaultInputValue` when an initial selection's label differs from its value.

Combobox owns its selection state and rendering parts independently of Autocomplete. Both use general headless utilities for rendering, controllable state, and transitions. Mosaic adds styling separately.
