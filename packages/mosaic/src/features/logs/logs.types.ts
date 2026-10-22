import type { SelectItem } from '../../components/select';

export interface LogEventActor {
  name: string;
  identifier?: string;
  imageUrl?: string;
  isCurrentUser?: boolean;
}

export interface LogEventLocation {
  city?: string;
  country?: string;
  countryCode?: string;
}

export type LogEventSource = 'clerk' | 'application';

export interface LogEvent {
  id: string;
  type: string;
  description: string;
  category: string;
  source: LogEventSource;
  dateLabel: string;
  timeLabel: string;
  timestampLabel: string;
  relativeLabel?: string;
  ipAddress?: string;
  location?: LogEventLocation;
  deviceLabel?: string;
  actor?: LogEventActor;
  payload: Record<string, unknown>;
}

export interface LogsTableViewProps {
  events: LogEvent[];
  totalCount: number;
  showActor?: boolean;
  applicationName: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories: SelectItem[];
  category: string;
  onCategoryChange: (category: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export interface LogDetailSheetViewProps {
  event: LogEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showActor?: boolean;
  applicationName: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

export interface LogsPanelViewProps {
  title: string;
  description: string;
  slot: string;
  table: LogsTableViewProps;
  detail: LogDetailSheetViewProps;
}
