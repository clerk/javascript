---
'@clerk/mosaic': minor
---

Add `AvatarGroup`, which stacks avatars in an overlapping row with an optional "+N" count of the ones left out. Each avatar is cut where the next one overlaps it, so whatever sits behind the group shows through the gap. `AvatarGroup.Root` sets the default `size` and `shape` (`circle` or `square`) of the avatars inside it; an avatar's own prop still wins. `AvatarGroup.Overflow` takes a `count`, renders nothing when it is 0 or less, and can be made a button with `render`.
