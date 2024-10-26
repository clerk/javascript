import * as Common from '@clerk/elements/common';
import * as React from 'react';

import { useAppearance } from '~/contexts';
import { useEnabledConnections } from '~/hooks/use-enabled-connections';
import { useLocalizations } from '~/hooks/use-localizations';
import { Button } from '~/primitives/button';
import { PROVIDERS } from '~/primitives/icons/providers';
import { applyDescriptors } from '~/utils/dva';

/**
 * Calculates the number of columns given the total number of items and the maximum columns allowed per row.
 *
 * @param {Object} options
 * @param {number} options.length - The total number of items.
 * @param {number} options.max - The maximum number of columns allowed per row.
 * @returns The calculated number of columns.
 *
 * Example output for item counts from 1 to 24 with `columns: 6`:
 *
 *  1:  [ 1 ]
 *  2:  [ 1, 2 ]
 *  3:  [ 1, 2, 3 ]
 *  4:  [ 1, 2, 3, 4 ]
 *  5:  [ 1, 2, 3, 4, 5 ]
 *  6:  [ 1, 2, 3, 4, 5, 6 ]
 *  7:  [ [1, 2, 3, 4], [5, 6, 7] ]
 *  8:  [ [1, 2, 3, 4], [5, 6, 7, 8] ]
 *  9:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9] ]
 * 10:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10] ]
 * 11:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11] ]
 * 12:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12] ]
 * 13:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13] ]
 * 14:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14] ]
 * 15:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15] ]
 * 16:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16] ]
 * 17:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17] ]
 * 18:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18] ]
 * 19:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19] ]
 * 20:  [ [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20] ]
 * 21:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15, 16], [17, 18, 19, 20, 21] ]
 * 22:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11], [12, 13, 14, 15, 16], [17, 18, 19, 20, 21, 22] ]
 * 23:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23] ]
 * 24:  [ [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24] ]
 *
 * Examples:
 * ```
 * getColumnCount(1); // 1
 * getColumnCount(7); // 4
 * getColumnCount(15); // 6
 * ```
 */
function getColumnCount({ length, max }: Record<'length' | 'max', number>): number {
  const numRows = Math.ceil(length / max);
  return Math.ceil(length / numRows);
}

export const layoutStyle = {
  connectionList: {
    className:
      '-m-[calc(var(--cl-connection-gap)/2)] flex flex-wrap items-center justify-center [--cl-connection-gap:theme(spacing.2)]',
  },
  connectionListItem: {
    className: 'w-full p-[calc(var(--cl-connection-gap)/2)] sm:w-[calc(100%/var(--cl-connection-columns))]',
  },
};

// Purposefully left blank to prevent confusion.
export const visualStyle = {};

export function Connections(
  props: { columns?: number } & Pick<React.ComponentProps<typeof Button>, 'disabled' | 'textVisuallyHidden'>,
) {
  const { t } = useLocalizations();
  const enabledConnections = useEnabledConnections();
  const { options, elements } = useAppearance().parsedAppearance;
  const connectionListDescriptors = applyDescriptors(elements, 'connectionList');
  const hasConnection = enabledConnections.length > 0;
  const textVisuallyHidden =
    typeof props?.textVisuallyHidden !== 'undefined'
      ? props.textVisuallyHidden
      : enabledConnections.length > 2 || options?.socialButtonsVariant === 'iconButton';
  const columns = getColumnCount({ length: enabledConnections.length, max: props?.columns || 6 });
  const localizationKey =
    enabledConnections.length === 1 ? 'socialButtonsBlockButton' : 'socialButtonsBlockButtonManyInView';

  return hasConnection ? (
    <ul
      className={connectionListDescriptors.className}
      style={{ ...connectionListDescriptors.style, '--cl-connection-columns': columns } as React.CSSProperties}
    >
      {enabledConnections.map(c => {
        return (
          <li
            key={c.provider}
            {...applyDescriptors(elements, 'connectionListItem')}
          >
            <Common.Loading scope={`provider:${c.provider}`}>
              {isConnectionLoading => {
                return (
                  <Common.Connection
                    name={c.provider}
                    asChild
                  >
                    <Button
                      descriptor={`buttonConnection__${c.provider}`}
                      intent='connection'
                      busy={isConnectionLoading}
                      disabled={props?.disabled || isConnectionLoading}
                      iconStart={PROVIDERS[c.provider] || null}
                      textVisuallyHidden={textVisuallyHidden}
                    >
                      {t(localizationKey, {
                        provider: c.name,
                      })}
                    </Button>
                  </Common.Connection>
                );
              }}
            </Common.Loading>
          </li>
        );
      })}
    </ul>
  ) : null;
}
