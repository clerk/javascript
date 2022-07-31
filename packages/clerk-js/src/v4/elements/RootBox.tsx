import React from 'react';

import { Col } from '../customizables';
import { makeCustomizable } from '../customizables/makeCustomizable';
import { PropsOfComponent } from '../styledSystem';

type RootBoxProps = React.PropsWithChildren<{ className: string }>;

const _InvisibleRootBox = React.memo((props: RootBoxProps) => {
  const [showSpan, setShowSpan] = React.useState(true);
  const parentRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const parent = parentRef.current;
    if (!parent) {
      return;
    }
    if (showSpan) {
      setShowSpan(false);
    }
    parent.className = props.className;
  }, [props.className]);

  return (
    <>
      {props.children}
      {showSpan && (
        <span
          ref={el => (parentRef.current = el ? el.parentElement : parentRef.current)}
          aria-hidden
          style={{ display: 'none' }}
        />
      )}
    </>
  );
});

export const InvisibleRootBox = makeCustomizable(_InvisibleRootBox, {
  defaultStyles: t => ({
    boxSizing: 'border-box',
    width: 'fit-content',

    fontFamily: t.fonts.$main,
    fontStyle: t.fontStyles.$normal,
  }),
});

export const RootBox = (props: PropsOfComponent<typeof Col>) => {
  return (
    <Col
      {...props}
      sx={t => ({
        boxSizing: 'border-box',
        width: 'fit-content',

        fontFamily: t.fonts.$main,
        fontStyle: t.fontStyles.$normal,
      })}
    />
  );
};
