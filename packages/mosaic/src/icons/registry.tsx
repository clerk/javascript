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
import { ChevronDoubleLeft } from './glyphs/chevron-double-left';
import { ChevronDoubleRight } from './glyphs/chevron-double-right';
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

const Code = glyph(
  <path
    d='M5.25 5.75L2.75 8L5.25 10.25M10.75 5.75L13.25 8L10.75 10.25'
    {...strokeProps}
  />,
);

const SecurityPasskey = glyph(
  <>
    <path
      d='M8.43754 5.0625C8.43754 4.44118 7.93386 3.9375 7.31254 3.9375C6.69122 3.9375 6.18754 4.44118 6.18754 5.0625C6.18754 5.68382 6.69122 6.1875 7.31254 6.1875C7.93386 6.1875 8.43754 5.68382 8.43754 5.0625ZM10.125 5.0625C10.125 6.6158 8.86584 7.875 7.31254 7.875C5.75924 7.875 4.50004 6.6158 4.50004 5.0625C4.50004 3.5092 5.75924 2.25 7.31254 2.25C8.86584 2.25 10.125 3.5092 10.125 5.0625Z'
      fill='currentColor'
    />
    <path
      d='M7.31254 9C7.93629 9 8.53595 9.12402 9.08573 9.33948C9.51942 9.5095 9.73343 9.99887 9.56364 10.4326C9.39361 10.8665 8.90326 11.0806 8.4694 10.9105C8.1027 10.7669 7.71165 10.6875 7.31254 10.6875C5.77377 10.6875 4.48879 11.6999 4.17155 13.0562L3.93974 14.0438C3.94311 14.0471 3.94803 14.0515 3.95512 14.0548C3.96327 14.0586 3.97581 14.0625 3.99467 14.0625H8.77812C9.24395 14.0627 9.62187 14.4404 9.62187 14.9062C9.62187 15.3721 9.24395 15.7498 8.77812 15.75H3.99467C2.9311 15.7498 2.03268 14.7896 2.29399 13.6725L2.52799 12.6716C3.03625 10.4987 5.04597 9 7.31254 9Z'
      fill='currentColor'
    />
    <path
      d='M15.1645 12.4805H11.6368V13.7922C11.6368 13.9476 11.7627 14.0735 11.918 14.0735H14.8832C15.0385 14.0735 15.1645 13.9476 15.1645 13.7922V12.4805ZM14.2163 10.4832C14.2161 10.0331 13.8513 9.66823 13.4012 9.66797C12.9508 9.66797 12.5851 10.0329 12.5849 10.4832V10.793H14.2163V10.4832ZM15.9038 10.793H16.0082C16.4742 10.793 16.852 11.1707 16.852 11.6367V13.7922C16.852 14.8795 15.9705 15.761 14.8832 15.761H11.918C10.8307 15.761 9.94926 14.8795 9.94926 13.7922V11.6367C9.94926 11.1707 10.327 10.793 10.793 10.793H10.8974V10.4832C10.8976 9.10091 12.0189 7.98047 13.4012 7.98047C14.7832 7.98073 15.9036 9.10107 15.9038 10.4832V10.793Z'
      fill='currentColor'
    />
  </>,
  '0 0 18 18',
);

const SecurityPhone = glyph(
  <>
    <path
      d='M6.04014 2.8125C5.54942 2.8125 5.0625 3.25236 5.0625 3.90841V14.0916C5.0625 14.7477 5.54941 15.1875 6.04014 15.1875H11.9599C12.4506 15.1875 12.9375 14.7477 12.9375 14.0916V3.90841C12.9375 3.25236 12.4506 2.8125 11.9599 2.8125H6.04014ZM3.375 3.90841C3.375 2.42196 4.51901 1.125 6.04014 1.125H11.9599C13.481 1.125 14.625 2.42197 14.625 3.90841V14.0916C14.625 15.5781 13.481 16.875 11.9599 16.875H6.04014C4.51902 16.875 3.375 15.5781 3.375 14.0916V3.90841Z'
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
    />
    <path
      d='M7.875 12.6562C7.875 12.1903 8.25276 11.8125 8.71875 11.8125H9.28125C9.74724 11.8125 10.125 12.1903 10.125 12.6562C10.125 13.1222 9.74724 13.5 9.28125 13.5H8.71875C8.25276 13.5 7.875 13.1222 7.875 12.6562Z'
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
    />
  </>,
  '0 0 18 18',
);

const SecurityLockSquare = glyph(
  <path
    d='M2.25 5.34375C2.25 3.63512 3.63512 2.25 5.34375 2.25H12.6562C14.3649 2.25 15.75 3.63512 15.75 5.34375V5.90625C15.75 6.37224 15.3722 6.75 14.9062 6.75C14.4403 6.75 14.0625 6.37224 14.0625 5.90625V5.34375C14.0625 4.5671 13.4329 3.9375 12.6562 3.9375H5.34375C4.5671 3.9375 3.9375 4.5671 3.9375 5.34375V12.6562C3.9375 13.4329 4.5671 14.0625 5.34375 14.0625H5.90625C6.37224 14.0625 6.75 14.4403 6.75 14.9062C6.75 15.3722 6.37224 15.75 5.90625 15.75H5.34375C3.63512 15.75 2.25 14.3649 2.25 12.6562V5.34375ZM11.8125 8.4375C11.1912 8.4375 10.6875 8.94118 10.6875 9.5625V10.125H12.9375V9.5625C12.9375 8.94118 12.4338 8.4375 11.8125 8.4375ZM14.625 10.125V9.5625C14.625 8.0092 13.3658 6.75 11.8125 6.75C10.2592 6.75 9 8.0092 9 9.5625V10.125H8.71875C8.25276 10.125 7.875 10.5028 7.875 10.9688V13.7812C7.875 14.8686 8.75644 15.75 9.84375 15.75H13.7812C14.8686 15.75 15.75 14.8686 15.75 13.7812V10.9688C15.75 10.5028 15.3722 10.125 14.9062 10.125H14.625ZM14.0625 11.8125H9.5625V13.7812C9.5625 13.9366 9.68842 14.0625 9.84375 14.0625H13.7812C13.9366 14.0625 14.0625 13.9366 14.0625 13.7812V11.8125Z'
    fill='currentColor'
    fillRule='evenodd'
    clipRule='evenodd'
  />,
  '0 0 18 18',
);

const DevicePhone = glyph(
  <>
    <path
      d='M4.6045 6.07587V5.87713H4.54673C4.53907 5.87337 4.5302 5.87275 4.52207 5.87541C4.51395 5.87807 4.50723 5.88379 4.5034 5.89132C4.49957 5.89885 4.49895 5.90757 4.50166 5.91556C4.50437 5.92355 4.51018 5.93015 4.51784 5.93391V7.18312C4.51784 7.18312 4.51785 7.23991 4.57561 7.23991V6.07587H4.6045Z'
      fill='#646464'
      fillRule='evenodd'
      clipRule='evenodd'
    />
    <path
      d='M4.6045 4.3725V4.17376H4.54673C4.53907 4.17 4.5302 4.16938 4.52207 4.17204C4.51395 4.1747 4.50723 4.18043 4.5034 4.18796C4.49957 4.19549 4.49895 4.2042 4.50166 4.21219C4.50437 4.22018 4.51018 4.22678 4.51784 4.23054V5.47975C4.51784 5.47975 4.51785 5.53654 4.57561 5.53654V4.3725H4.6045Z'
      fill='#646464'
      fillRule='evenodd'
      clipRule='evenodd'
    />
    <path
      d='M11.9117 0C12.9515 0 13.5002 0.596216 13.5002 1.6183V16.4953C13.5002 17.4606 12.836 18 11.8251 18H6.22201C5.1245 18 4.54686 17.3186 4.57574 16.4669V1.6183C4.57574 0.596216 5.15339 0 6.19314 0H11.9117Z'
      fill='#343434'
    />
    <path
      d='M11.7958 0.168701C12.8644 0.168701 13.3554 0.679743 13.3554 1.70182V16.4652C13.3554 17.3738 12.72 17.8848 11.7669 17.8848H6.27935C5.35513 17.8848 4.71973 17.317 4.71973 16.4652V1.70182C4.71973 0.679743 5.2396 0.168701 6.30823 0.168701H11.7958Z'
      fill='#575757'
      stroke='#444444'
      strokeWidth={0.140625}
    />
    <path
      d='M6.77197 0.481689C6.82974 0.481689 6.85862 0.510079 6.85862 0.595252V0.652036C6.85862 0.907557 7.08966 1.13469 7.32072 1.13469H10.7288C11.0176 1.13469 11.2198 0.907557 11.2198 0.652036V0.595252C11.2198 0.510079 11.2487 0.481689 11.3064 0.481689H12.1729C12.635 0.481689 13.0393 0.964338 13.0393 1.4186V16.5795C13.0393 17.0621 12.6061 17.5164 12.0574 17.5164H5.99216C5.38564 17.5164 5.03906 17.1473 5.03906 16.6079V1.4186C5.03906 0.964338 5.41452 0.481689 5.87663 0.481689H6.74308H6.77197Z'
      fill='black'
      fillRule='evenodd'
      clipRule='evenodd'
    />
    <path
      d='M9.77424 0.7378C9.77873 0.726659 9.78079 0.714714 9.78027 0.702742C9.77974 0.690769 9.77664 0.679039 9.77119 0.668321C9.76574 0.657602 9.75805 0.648135 9.74862 0.640539C9.7392 0.632942 9.72823 0.627388 9.71647 0.624237C9.70509 0.620508 9.69309 0.619019 9.68113 0.619855C9.66916 0.620691 9.65748 0.623833 9.64675 0.629106C9.63602 0.634379 9.62646 0.641678 9.6186 0.650585C9.61074 0.659492 9.60475 0.669833 9.60095 0.681018C9.59716 0.692203 9.59564 0.704012 9.59649 0.715773C9.59734 0.727533 9.60054 0.739016 9.60591 0.749561C9.61127 0.760107 9.61869 0.76951 9.62775 0.777235C9.63681 0.78496 9.64734 0.790855 9.65872 0.794583C9.67005 0.799 9.6822 0.801015 9.69438 0.800499C9.70656 0.799982 9.71849 0.796945 9.72939 0.791585C9.7403 0.786226 9.74992 0.778666 9.75765 0.769398C9.76538 0.76013 9.77103 0.749362 9.77424 0.7378ZM8.30127 0.681018C8.30127 0.7378 8.30127 0.766193 8.35904 0.766193H9.1966C9.21432 0.760068 9.22953 0.748448 9.23995 0.733086C9.25037 0.717724 9.25543 0.699451 9.25437 0.681018C9.25023 0.667614 9.2428 0.655421 9.23272 0.645516C9.22264 0.635612 9.21024 0.628303 9.1966 0.624237H8.35904C8.3454 0.628303 8.33299 0.635612 8.32292 0.645516C8.31284 0.655421 8.30541 0.667614 8.30127 0.681018Z'
      fill='black'
      fillRule='evenodd'
      clipRule='evenodd'
    />
  </>,
  '0 0 18 18',
);

const DeviceLaptop = glyph(
  <>
    <path
      d='M1.63696 4.19191C1.63696 3.86515 1.68002 3.7251 1.76614 3.58506C1.8738 3.46836 2.02453 3.375 2.36903 3.375H15.6537C15.9551 3.375 16.0843 3.44502 16.192 3.56172C16.2996 3.67842 16.3427 3.8418 16.3427 4.19191V13.7614C16.3427 14.0882 16.2996 14.2282 16.235 14.3216C16.1805 14.402 16.1091 14.4672 16.0267 14.5118C15.9444 14.5565 15.8534 14.5792 15.7614 14.5783H2.19677C2.02452 14.5783 1.85227 14.5083 1.76614 14.3449C1.68002 14.2516 1.63696 14.1115 1.63696 13.7614V4.19191Z'
      fill='black'
    />
    <path
      d='M1.93797 14.2505H16.0408C16.1054 14.2505 16.17 14.2038 16.2131 14.1571C16.2561 14.1104 16.2561 14.0404 16.2561 13.8304V4.19083C16.2561 3.91075 16.2346 3.72403 16.127 3.63067C16.0193 3.51397 15.9116 3.46729 15.6533 3.46729H2.36859C2.08868 3.46729 1.93797 3.53731 1.83031 3.65401C1.74419 3.74737 1.72266 3.88741 1.72266 4.19083V13.8304C1.72266 14.0404 1.72265 14.1104 1.76571 14.1571C1.80877 14.2038 1.87337 14.2505 1.93797 14.2505Z'
      fill='#575757'
    />
    <path
      d='M8.99922 3.88789C9.00895 3.89489 9.02025 3.8989 9.03192 3.89949C9.04358 3.90008 9.05518 3.89723 9.06547 3.89124C9.07576 3.88525 9.08436 3.87635 9.09036 3.86549C9.09635 3.85463 9.09952 3.8422 9.09952 3.82954C9.09952 3.81688 9.09635 3.80446 9.09036 3.79359C9.08436 3.78273 9.07576 3.77383 9.06547 3.76785C9.05518 3.76186 9.04358 3.75901 9.03192 3.7596C9.02025 3.76019 9.00895 3.76419 8.99922 3.77119C8.98949 3.76419 8.97819 3.76019 8.96653 3.7596C8.95486 3.75901 8.94327 3.76186 8.93298 3.76785C8.92269 3.77383 8.91408 3.78273 8.90809 3.79359C8.90209 3.80446 8.89893 3.81688 8.89893 3.82954C8.89893 3.8422 8.90209 3.85463 8.90809 3.86549C8.91408 3.87635 8.92269 3.88525 8.93298 3.89124C8.94327 3.89723 8.95486 3.90008 8.96653 3.89949C8.97819 3.8989 8.98949 3.89489 8.99922 3.88789Z'
      fill='black'
      stroke='black'
      strokeWidth={0.16875}
      fillRule='evenodd'
      clipRule='evenodd'
    />
    <path
      d='M0 14.344V14.2273H18V14.344C18 14.344 17.5909 14.484 17.1388 14.5307C16.8373 14.5541 16.3421 14.6241 15.2225 14.6241H2.86363C1.89473 14.6241 1.07655 14.5541 0.710524 14.5074C0.344495 14.4607 0 14.344 0 14.344Z'
      fill='#444444'
      fillRule='evenodd'
      clipRule='evenodd'
    />
    <path
      d='M2.21704 4.12207H15.7816V13.3181H2.21704V4.12207Z'
      fill='black'
      fillRule='evenodd'
      clipRule='evenodd'
    />
  </>,
  '0 0 18 18',
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
  'device-laptop': DeviceLaptop,
  'device-phone': DevicePhone,
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
  'security-lock-square': SecurityLockSquare,
  'security-passkey': SecurityPasskey,
  'security-phone': SecurityPhone,
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
