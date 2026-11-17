import {
  ArrowFatUp, ArrowFatDown, CheckFat, PlusCircle, XCircle, Play, SpeakerHigh, CaretLeft, ArrowCircleRight, MagnifyingGlass,
  House, ListBullets, User, TextAa, Hand, Microphone, Camera, VideoCamera, MapPin, FileText, ChatCircle, Link as LinkIcon,
  Cube, Star, Clock, DownloadSimple, Export, Buildings, Bell, Eye, Moon, Sun, DotsThreeOutline, Warning, Lock, PaperPlaneRight,
  GraduationCap, Ruler, Footprints, EnvelopeSimple, DeviceMobile, ArrowClockwise, Stack, Flag, CalendarBlank, ChartBar,
  ArrowBendUpLeft, ClosedCaptioning, ChatsCircle, CaretDown, Question, SignOut, Stop, CaretUp,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhIcon } from '@phosphor-icons/react'

const MAP = {
  up: ArrowFatUp, down: ArrowFatDown, check: CheckFat, plus: PlusCircle, x: XCircle, play: Play, sound: SpeakerHigh,
  back: CaretLeft, arrow: ArrowCircleRight, search: MagnifyingGlass, home: House, list: ListBullets, user: User, text: TextAa,
  hand: Hand, mic: Microphone, camera: Camera, video: VideoCamera, pin: MapPin, file: FileText, chat: ChatCircle, link: LinkIcon,
  cube: Cube, star: Star, clock: Clock, download: DownloadSimple, share: Export, building: Buildings, bell: Bell, eye: Eye,
  moon: Moon, sun: Sun, more: DotsThreeOutline, alert: Warning, lock: Lock, send: PaperPlaneRight, grad: GraduationCap,
  ruler: Ruler, piso: Footprints, mail: EnvelopeSimple, phone: DeviceMobile, rotate: ArrowClockwise, layers: Stack, flag: Flag,
  calendar: CalendarBlank, chart: ChartBar, reply: ArrowBendUpLeft, cc: ClosedCaptioning, thread: ChatsCircle,
  caretdown: CaretDown, caretup: CaretUp, question: Question, signout: SignOut, stop: Stop,
} satisfies Record<string, PhIcon>

export type IconName = keyof typeof MAP

export function Icon({ name, size, className = '' }: { name: IconName; size?: 16 | 24 | 28; className?: string }) {
  const C = MAP[name]
  return <C weight="fill" aria-hidden="true" focusable="false" className={`ic${size ? ` s${size}` : ''} ${className}`.trim()} />
}
