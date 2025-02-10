import { QRCodeSVG } from 'qrcode.react';

import { descriptors, Flex } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

type QRCodeProps = PropsOfComponent<typeof Flex> & { url: string; size?: number };

export const QRCode = (props: QRCodeProps) => {
  const { size = 200, url, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.qrCodeRow}
      {...rest}
    >
      <Flex
        elementDescriptor={descriptors.qrCodeContainer}
        sx={t => ({ backgroundColor: 'white', padding: t.space.$2x5 })}
      >
        <QRCodeSVG
          value={url || ''}
          size={size}
        />
      </Flex>
    </Flex>
  );
};
