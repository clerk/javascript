import { PrintableComponent } from '../../common';
import { Box, Button, Col, Grid, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { ArrowDownTray, Checkmark, Copy, Print } from '../../icons';
import type { useMfaBackupCodeListController } from './mfa-backup-code-list.controller';
import { MfaBackupCodeTile } from './MfaBackupCodeTile';

export const MfaBackupCodeListView = ({
  controller,
}: {
  controller: ReturnType<typeof useMfaBackupCodeListController>;
}) => {
  if (!controller.hasUser) {
    return null;
  }

  if (!controller.backupCodes) {
    return null;
  }

  return (
    <>
      <Box
        sx={t => ({
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha100,
          borderRadius: t.radii.$lg,
        })}
      >
        <Col
          gap={1}
          sx={t => ({
            padding: t.space.$4,
          })}
        >
          <Text
            localizationKey={localizationKeys('userProfile.backupCodePage.title__codelist')}
            variant='subtitle'
            sx={{ textAlign: 'start' }}
          />
          <Text
            localizationKey={controller.subtitle}
            variant='body'
            sx={{ textAlign: 'start' }}
            colorScheme='secondary'
          />
        </Col>
        <Grid
          gap={2}
          sx={t => ({
            gridTemplateColumns: `repeat(2, minmax(${t.sizes.$12}, 1fr))`,
            paddingBlock: t.space.$2,
            backgroundColor: t.colors.$neutralAlpha50,
            color: t.colors.$colorMutedForeground,
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$borderAlpha100,
          })}
        >
          {controller.backupCodes.map((code, i) => (
            <MfaBackupCodeTile
              key={i}
              code={code}
            />
          ))}
        </Grid>

        <Grid
          sx={t => ({
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$borderAlpha100,
            gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
            '>:not([hidden])~:not([hidden])': {
              borderInlineEndWidth: '0px',
              borderInlineStartWidth: '1px',
              borderStyle: 'solid',
              borderColor: t.colors.$borderAlpha100,
            },
            '>:first-child': {
              borderEndStartRadius: t.radii.$lg,
            },
            '>:last-child': {
              borderEndEndRadius: t.radii.$lg,
            },
          })}
        >
          <Button
            variant='ghost'
            sx={t => ({ width: '100%', padding: `${t.space.$0x25} 0`, borderRadius: 0 })}
            onClick={controller.onDownloadTxtFile}
          >
            <Icon icon={ArrowDownTray} />
          </Button>

          <Button
            variant='ghost'
            sx={t => ({ width: '100%', padding: `${t.space.$2} 0`, borderRadius: 0 })}
            onClick={controller.print}
          >
            <Icon icon={Print} />
          </Button>
          <Button
            variant='ghost'
            onClick={controller.onCopy}
            sx={t => ({ width: '100%', padding: `${t.space.$2} 0`, borderRadius: 0 })}
          >
            <Icon icon={controller.hasCopied ? Checkmark : Copy} />
          </Button>
        </Grid>
      </Box>

      <PrintableComponent {...controller.printableProps}>
        <Heading>
          Your backup codes for {controller.applicationName} account {controller.userIdentifier}:
        </Heading>
        <Col gap={2}>
          {controller.backupCodes.map((code, i) => (
            <MfaBackupCodeTile
              key={i}
              code={code}
            />
          ))}
        </Col>
      </PrintableComponent>
    </>
  );
};
