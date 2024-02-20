/**
 * Adapted from https://github.com/leonardodino/rci/blob/main/packages/use-code-input/src/index.ts
 * MIT License
 * Copyright (c) 2020 Leonardo Dino
 */

import * as React from "react"
export type SelectionState = readonly [start: number, end: number]

type TransformInput = {
  current: Readonly<SelectionState>
  previous: Readonly<SelectionState>
  value: string
  direction: 'forward' | 'backward' | 'none' | null
}

// TODO: fix firefox direction
type Transform = (input: TransformInput) => [start: number, end: number] | null

const transform: Transform = ({ current, previous, value }) => {
  if (current[0] !== current[1]) return null
  if (typeof current[0] !== 'number') return null
  if (typeof current[1] !== 'number') return null

  const [start, end] = current

  if (start > 0 && previous[0] === start && previous[1] === start + 1) {
    return [start - 1, end]
  }

  if (value[start]?.length) {
    return [start, end + 1]
  }

  // TODO: add switch prop for this behaviour
  // if (eq(current, [input.maxLength, input.maxLength])) {
  //  return [input.maxLength -1, input.maxLength]
  // }

  return null
}

const getSelectionState = (input: HTMLInputElement): SelectionState => {
  return [+input.selectionStart!, +input.selectionEnd!]
}

const ZERO: SelectionState = [0, 0]
const eq = (a: SelectionState, b: SelectionState): boolean => {
  return a[0] === b[0] && a[1] === b[1]
}

const useCodeInputHandler = ({
  inputRef,
  setSelection,
}: {
  inputRef: React.RefObject<HTMLInputElement>
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>
}) => {
  return React.useCallback(
    ({ type }: { type: string }) => {
      const input = inputRef.current
      console.log({ input, type })
      const previous = [input?.selectionStart ?? 0, input?.selectionEnd ?? 0] as SelectionState
      if (!previous || !input) return

      const { selectionDirection: direction, value } = input
      const current = getSelectionState(input)

      const save = (selection: SelectionState): void => {
        if (eq(selection, previous)) {
          if (eq(selection, ZERO)) return
          if (eq(selection, getSelectionState(input))) return
        }
        setSelection((state) => (eq(state, selection) ? state : selection))
        input.setSelectionRange(...selection, direction || undefined)
      }

      if (type === 'selectionchange' && document.activeElement !== input) {
        return save([value.length, value.length] as const)
      }

      save(transform({ previous, current, direction, value }) || current)
    },
    [inputRef, setSelection],
  )
}

const useCodeInputEffect = ({
  inputRef,
  handler,
}: {
  inputRef: React.RefObject<HTMLInputElement>
  handler: (event: Event) => void
}): void => {
  React.useLayoutEffect(() => {
    const input = inputRef.current

    if (document.activeElement !== input) {
      return
    }

    input?.addEventListener('input', handler)
    document.addEventListener('selectionchange', handler)
    return () => {
      input?.removeEventListener('input', handler)
      document.removeEventListener('selectionchange', handler)
    }
  }, [inputRef, handler])
}

export const useCodeInput = (inputRef: React.RefObject<HTMLInputElement>) => {
  const [selection, setSelection] = React.useState<SelectionState>(ZERO)
  const handler = useCodeInputHandler({ inputRef, setSelection })

  useCodeInputEffect({ inputRef, handler })

  return selection
}