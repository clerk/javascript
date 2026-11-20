'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Icon, IconFrame } from '@clerk/mosaic/components/icon';
import { ChevronRight } from '@clerk/mosaic/icons/glyphs/chevron-right';
import { Key } from '@clerk/mosaic/icons/glyphs/key';
import { ShieldCheck } from '@clerk/mosaic/icons/glyphs/shield-check';

export default function IconExample() {
  return (
    <>
      <Icon
        glyph={ShieldCheck}
        size='sm'
      />
      <Icon glyph={ShieldCheck} />
      <Icon
        glyph={ShieldCheck}
        size='lg'
      />
      <IconFrame>
        <Icon glyph={Key} />
      </IconFrame>
      <IconFrame
        filled
        bordered={false}
      >
        <Icon glyph={Key} />
      </IconFrame>
      <Button>
        Next
        <Icon
          glyph={ChevronRight}
          placement='inline-end'
        />
      </Button>
    </>
  );
}
