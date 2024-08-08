import * as SignIn from '@clerk/elements/sign-in';

import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import * as Icon from '~/primitives/icon';
import { formatSafeIdentifier } from '~/utils/format-safe-identifier';

export function StartOver(props: { shouldFormatSafeIdentifier?: boolean }) {
  return (
    <span className='flex items-center justify-center gap-2'>
      <SignIn.SafeIdentifier transform={props?.shouldFormatSafeIdentifier ? formatSafeIdentifier : undefined} />
      <SignIn.Action
        navigate='start'
        asChild
      >
        <button
          type='button'
          className='text-accent-9 size-4 rounded-sm outline-none focus-visible:ring'
          aria-label={LOCALIZATION_NEEDED.accessibleLabel__startOver}
        >
          <Icon.PencilUnderlined />
        </button>
      </SignIn.Action>
    </span>
  );
}
