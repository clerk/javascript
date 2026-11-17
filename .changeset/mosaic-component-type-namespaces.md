---
'@clerk/mosaic': minor
---

**Breaking:** Rename the root props types of seven components to `<Component>RootProps`, matching the rest of the package. The props themselves are unchanged; TypeScript flags the old names.

| Before            | After                 |
| ----------------- | --------------------- |
| `AvatarProps`     | `AvatarRootProps`     |
| `CardProps`       | `CardRootProps`       |
| `DataListProps`   | `DataListRootProps`   |
| `EmptyStateProps` | `EmptyStateRootProps` |
| `ItemProps`       | `ItemRootProps`       |
| `MenuProps`       | `MenuRootProps`       |
| `SelectProps`     | `SelectRootProps`     |

Find usages with `git grep -nwE 'AvatarProps|CardProps|DataListProps|EmptyStateProps|ItemProps|MenuProps|SelectProps'`.

Every component's props type can now also be read from the component, the way Base UI exposes them: `Avatar.Root.Props` is `AvatarRootProps` and `Badge.Props` is `BadgeProps`. Generic parts take the same type argument, such as `Select.Root.Props<string>`. Parts that had no named props type now have one, such as `CardHeaderProps`, `EntityRootProps` and `ItemMediaProps`, and `ClerkLogoProps` is new.
