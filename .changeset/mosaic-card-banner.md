---
'@clerk/mosaic': patch
---

Adds `Card.Banner`, a slot between `Card.Header` and `Card.Content` that animates a `Banner` open when it is given a message and closed when the message clears, with a fade along the moving edge. Profile and reverification dialogs now show their submission errors through it instead of inserting the banner without motion. Adds the `--cl-ease-in-out` motion token for layout changes that start and end at rest.
