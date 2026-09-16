import type { IconComponent } from './glyph';
import { glyph } from './glyph';
import { Api } from './glyphs/api';
import { Application2 } from './glyphs/application-2';
import { ArrowBottomTop } from './glyphs/arrow-bottom-top';
import { ArrowCompress } from './glyphs/arrow-compress';
import { ArrowDots } from './glyphs/arrow-dots';
import { ArrowDown } from './glyphs/arrow-down';
import { ArrowDownCircle } from './glyphs/arrow-down-circle';
import { ArrowDownLeft } from './glyphs/arrow-down-left';
import { ArrowLeft } from './glyphs/arrow-left';
import { ArrowLeftRight } from './glyphs/arrow-left-right';
import { ArrowRight } from './glyphs/arrow-right';
import { ArrowUp } from './glyphs/arrow-up';
import { ArrowUpCircle } from './glyphs/arrow-up-circle';
import { ArrowUpLeft } from './glyphs/arrow-up-left';
import { ArrowUpRight } from './glyphs/arrow-up-right';
import { Block } from './glyphs/block';
import { Bolt } from './glyphs/bolt';
import { Building } from './glyphs/building';
import { Calendar } from './glyphs/calendar';
import { Checkmark } from './glyphs/checkmark';
import { CheckmarkCircle } from './glyphs/checkmark-circle';
import { CheckmarkSmall } from './glyphs/checkmark-small';
import { ChevronDown } from './glyphs/chevron-down';
import { ChevronLeft } from './glyphs/chevron-left';
import { ChevronRight } from './glyphs/chevron-right';
import { ChevronUp } from './glyphs/chevron-up';
import { ChevronUpDown } from './glyphs/chevron-up-down';
import { Clipboard } from './glyphs/clipboard';
import { Clock } from './glyphs/clock';
import { Cloud } from './glyphs/cloud';
import { Cog6Teeth } from './glyphs/cog-6-teeth';
import { Columns } from './glyphs/columns';
import { CreditCard } from './glyphs/credit-card';
import { Devices } from './glyphs/devices';
import { Document } from './glyphs/document';
import { Dollar } from './glyphs/dollar';
import { DottedSquare } from './glyphs/dotted-square';
import { Download } from './glyphs/download';
import { Duplicate } from './glyphs/duplicate';
import { EllipsisHorizontal } from './glyphs/ellipsis-horizontal';
import { EllipsisHorizontalCircle } from './glyphs/ellipsis-horizontal-circle';
import { EllipsisVertical } from './glyphs/ellipsis-vertical';
import { EnterpriseConnections } from './glyphs/enterprise-connections';
import { Envelope } from './glyphs/envelope';
import { ExclamationCircle } from './glyphs/exclamation-circle';
import { Export } from './glyphs/export';
import { Eye } from './glyphs/eye';
import { EyeSlash } from './glyphs/eye-slash';
import { FaceScan } from './glyphs/face-scan';
import { Filter } from './glyphs/filter';
import { Fingerprint } from './glyphs/fingerprint';
import { Flag } from './glyphs/flag';
import { Globe } from './glyphs/globe';
import { Grip } from './glyphs/grip';
import { InformationCircle } from './glyphs/information-circle';
import { Key } from './glyphs/key';
import { Link } from './glyphs/link';
import { Lock } from './glyphs/lock';
import { LogOut } from './glyphs/log-out';
import { MagnifyingGlass } from './glyphs/magnifying-glass';
import { Minus } from './glyphs/minus';
import { MinusCircle } from './glyphs/minus-circle';
import { Numbers } from './glyphs/numbers';
import { PasskeyAdded } from './glyphs/passkey-added';
import { Pen } from './glyphs/pen';
import { Phone } from './glyphs/phone';
import { Plus } from './glyphs/plus';
import { QuestionMarkCircle } from './glyphs/question-mark-circle';
import { ReceiptBill } from './glyphs/receipt-bill';
import { RotateAntiClockwise } from './glyphs/rotate-anti-clockwise';
import { RotateLeftRight } from './glyphs/rotate-left-right';
import { Route } from './glyphs/route';
import { Shield } from './glyphs/shield';
import { ShieldCheck } from './glyphs/shield-check';
import { ShieldClose } from './glyphs/shield-close';
import { Sidebar } from './glyphs/sidebar';
import { Spinner } from './glyphs/spinner';
import { Support } from './glyphs/support';
import { Trash } from './glyphs/trash';
import { UserCircle } from './glyphs/user-circle';
import { UserCirclePlus } from './glyphs/user-circle-plus';
import { Users } from './glyphs/users';
import { X } from './glyphs/x';
import { XCircle } from './glyphs/x-circle';

const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const ChevronDoubleLeft = glyph(
  <>
    <path
      d='M7.25 11.25L3.75 8L7.25 4.75'
      {...strokeProps}
    />
    <path
      d='M11.75 11.25L8.25 8L11.75 4.75'
      {...strokeProps}
    />
  </>,
);

const ChevronDoubleRight = glyph(
  <>
    <path
      d='M8.75 11.25L12.25 8L8.75 4.75'
      {...strokeProps}
    />
    <path
      d='M4.25 11.25L7.75 8L4.25 4.75'
      {...strokeProps}
    />
  </>,
);

const Code = glyph(
  <path
    d='M5.25 5.75L2.75 8L5.25 10.25M10.75 5.75L13.25 8L10.75 10.25'
    {...strokeProps}
  />,
);

/** Runtime name → glyph map. `Icon`'s `name` prop is typed from these keys. */
export const iconRegistry = {
  api: Api,
  'application-2': Application2,
  'arrow-bottom-top': ArrowBottomTop,
  'arrow-compress': ArrowCompress,
  'arrow-dots': ArrowDots,
  'arrow-down': ArrowDown,
  'arrow-down-circle': ArrowDownCircle,
  'arrow-down-left': ArrowDownLeft,
  'arrow-left': ArrowLeft,
  'arrow-left-right': ArrowLeftRight,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-up-circle': ArrowUpCircle,
  'arrow-up-left': ArrowUpLeft,
  'arrow-up-right': ArrowUpRight,
  block: Block,
  bolt: Bolt,
  building: Building,
  calendar: Calendar,
  checkmark: Checkmark,
  'checkmark-circle': CheckmarkCircle,
  'checkmark-small': CheckmarkSmall,
  'chevron-double-left': ChevronDoubleLeft,
  'chevron-double-right': ChevronDoubleRight,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-up-down': ChevronUpDown,
  clipboard: Clipboard,
  clock: Clock,
  cloud: Cloud,
  code: Code,
  'cog-6-teeth': Cog6Teeth,
  columns: Columns,
  'credit-card': CreditCard,
  devices: Devices,
  document: Document,
  dollar: Dollar,
  'dotted-square': DottedSquare,
  download: Download,
  duplicate: Duplicate,
  'ellipsis-horizontal': EllipsisHorizontal,
  'ellipsis-horizontal-circle': EllipsisHorizontalCircle,
  'ellipsis-vertical': EllipsisVertical,
  'enterprise-connections': EnterpriseConnections,
  envelope: Envelope,
  'exclamation-circle': ExclamationCircle,
  export: Export,
  eye: Eye,
  'eye-slash': EyeSlash,
  'face-scan': FaceScan,
  filter: Filter,
  fingerprint: Fingerprint,
  flag: Flag,
  globe: Globe,
  grip: Grip,
  'information-circle': InformationCircle,
  key: Key,
  link: Link,
  lock: Lock,
  'log-out': LogOut,
  'magnifying-glass': MagnifyingGlass,
  minus: Minus,
  'minus-circle': MinusCircle,
  numbers: Numbers,
  'passkey-added': PasskeyAdded,
  pen: Pen,
  phone: Phone,
  plus: Plus,
  'question-mark-circle': QuestionMarkCircle,
  'receipt-bill': ReceiptBill,
  'rotate-anti-clockwise': RotateAntiClockwise,
  'rotate-left-right': RotateLeftRight,
  route: Route,
  shield: Shield,
  'shield-check': ShieldCheck,
  'shield-close': ShieldClose,
  sidebar: Sidebar,
  spinner: Spinner,
  support: Support,
  trash: Trash,
  'user-circle': UserCircle,
  'user-circle-plus': UserCirclePlus,
  users: Users,
  x: X,
  'x-circle': XCircle,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconRegistry;
