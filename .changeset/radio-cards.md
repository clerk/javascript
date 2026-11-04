---
'@clerk/mosaic': minor
---

Add radio cards. `Radio.Card` is one choice laid out as an `Item` row. A click anywhere on the card picks its `value`. Fill it with `Radio.Media` and `Radio.Content`, which holds `Radio.Label` (names the radio) and an optional `Radio.Description` (describes it).

`Radio.Group` takes `layout='stack' | 'grid'`. The default, `stack`, gives each choice its own row. `grid` fits as many columns of cards as the width allows. `Radio.Section` splits a group into titled sets of choices, each with its own `layout`. Arrow keys move across sections, and the whole picker is one Tab stop.

```tsx
<Radio.Group aria-label='Identity provider' defaultValue='okta' layout='grid'>
  <Radio.Card value='okta'>
    <Radio.Content>
      <Radio.Label>Okta workforce</Radio.Label>
      <Radio.Description>Okta Workforce Identity Cloud.</Radio.Description>
    </Radio.Content>
  </Radio.Card>
</Radio.Group>
```
