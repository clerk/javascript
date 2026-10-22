import { Panel } from '../../components/panel';
import { Text } from '../../components/text';
import { themeProps } from '../../props';
import { LogDetailSheetView } from './log-detail-sheet.view';
import { styles } from './logs.styles';
import type { LogsPanelViewProps } from './logs.types';
import { LogsTableView } from './logs-table.view';

export function LogsPanelView({ title, description, slot, table, detail }: LogsPanelViewProps) {
  return (
    <Panel.Root render={<div {...themeProps(slot)} />}>
      <Panel.Title>{title}</Panel.Title>
      <Text
        color='foreground-secondary'
        xstyle={styles.description}
      >
        {description}
      </Text>
      <LogsTableView {...table} />
      <LogDetailSheetView {...detail} />
    </Panel.Root>
  );
}
