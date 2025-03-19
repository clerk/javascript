---
'@clerk/shared': minor
'@clerk/clerk-js': patch
---

This introducing changes to `useReverification`, the changes include removing the array and returning the fetcher directly and also the dropping the options `throwOnCancel` and `onCancel` in favour of always throwing the cancellation error.

```tsx {{ filename: 'src/components/MyButton.tsx' }}
import { useReverification } from '@clerk/clerk-react'
import { isClerkRuntimeError } from '@clerk/clerk-react/error'

export function MyButton() {
  const enhancedFetcher = useReverification(() => fetch('/api/balance'))

  const handleClick = async () => {
    try {
      const myData = await enhancedFetcher()
      // If `myData` is null, the user canceled the reverification process
      // You can choose how your app responds. This example returns null.
      if (!myData) return
    } catch (e) {
      // Handle error returned from the fetcher

      // You can also handle cancellation with the following
      if (isClerkRuntimeError(err) && err.code === 'reverification_cancelled') {
        // Handle the cancellation error here
      }
    }
  }

  return <button onClick={handleClick}>Update User</button>
}
```

These changes are also adding a new handler in options called `onNeedsReverification`, which can be used to create a custom UI
to handle re-verification flow. When the handler is passed the default UI our AIO components provide will not be triggered so you will have to create and handle the re-verification process.


```tsx {{ filename: 'src/components/MyButtonCustom.tsx' }}
import { useReverification } from '@clerk/react'
import { isClerkRuntimeError } from '@clerk/react/error'

export function MyButton() {
  const enhancedFetcher = useReverification(() => fetch('/api/balance'), {
    onNeedsReverification: ({ complete, cancel, level }) => {
      // e.g open a modal here and handle the re-verification flow
    }
  })

  const handleClick = async () => {
    try {
      const myData = await enhancedFetcher()
      // If `myData` is null, the user canceled the reverification process
      // You can choose how your app responds. This example returns null.
      if (!myData) return
    } catch (e) {
      // Handle error returned from the fetcher
    }
  }

  return <button onClick={handleClick}>Update User</button>
}
```
