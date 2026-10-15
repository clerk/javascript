import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { EvidenceMark, TapMark } from '../../specs/support/evidence.ts';
import type { Runner } from './exec.ts';
import type { EvidencePath, EvidenceRecord, EvidenceSpan, EvidenceTap, Viewport } from './types.ts';

export interface Span {
  readonly from: number;
  readonly to: number;
}

export const CUT = {
  contextBefore: 1,
  contextAfter: 0.5,
  stillHold: 1,
  resultHold: 2,
  stillAtLeast: 0.5,
  shortestPiece: 0.05,
  fps: 30,
} as const;

// An Android screen can change within a frame of the touch, so a pulse drawn at the touch shows on the next screen. Each pulse starts leadSeconds before the tapped control first changes in the video.
export const PULSE = { seconds: 0.5, widthShare: 0.1, leadSeconds: 0.2 } as const;

// simctl on a CI runner writes decode times seconds behind the presentation times, and ffmpeg then stamps frames by decode time.
const readByPresentationTime = (video: EvidencePath): readonly string[] => ['-fflags', '+igndts', '-i', video];

// On a CI runner the iOS simulator has shown a tap's effect up to 2.9 s after the runner returned, so the scan looks until 5 s after the return.
export const REACTION = { after: 5, stillFor: 0.1, level: 8, share: 0.02, width: 0.4, height: 0.06 } as const;

export function spansOfMarks(marks: readonly EvidenceMark[], videoStartedAt: number): readonly EvidenceSpan[] {
  return marks
    .map((mark) => ({ label: mark.label, from: (mark.startedAt - videoStartedAt) / 1000, to: (mark.endedAt - videoStartedAt) / 1000, passed: mark.passed }))
    .filter((span) => span.to > 0)
    .map((span) => ({ ...span, from: Math.max(0, round(span.from)), to: round(span.to) }));
}

function parseMark(line: string): EvidenceMark | null {
  try {
    const mark = JSON.parse(line) as Partial<EvidenceMark>;
    return typeof mark.label === 'string' && typeof mark.startedAt === 'number' && typeof mark.endedAt === 'number' && typeof mark.passed === 'boolean'
      ? { label: mark.label, startedAt: mark.startedAt, endedAt: mark.endedAt, passed: mark.passed }
      : null;
  } catch {
    return null;
  }
}

function parseTap(line: string): TapMark | null {
  try {
    const tap = JSON.parse(line) as Partial<TapMark>;
    return typeof tap.sentAt === 'number' && typeof tap.tappedAt === 'number' && typeof tap.x === 'number' && typeof tap.y === 'number'
      ? { sentAt: tap.sentAt, tappedAt: tap.tappedAt, x: tap.x, y: tap.y }
      : null;
  } catch {
    return null;
  }
}

const linesOf = (file: string): readonly string[] => (existsSync(file) ? readFileSync(file, 'utf8').split('\n') : []);

export const readMarks = (file: string): readonly EvidenceMark[] => linesOf(file).flatMap((line) => parseMark(line) ?? []);

export const readTaps = (file: string): readonly TapMark[] => linesOf(file).flatMap((line) => parseTap(line) ?? []);

export interface TapWindow {
  readonly sent: number;
  readonly until: number;
  readonly x: number;
  readonly y: number;
}

export function tapWindows(taps: readonly TapMark[], videoStartedAt: number): readonly TapWindow[] {
  const seconds = (at: number): number => (at - videoStartedAt) / 1000;
  return taps
    .filter((tap) => tap.tappedAt > videoStartedAt)
    .map((tap, i, kept) => {
      const nextSentAt = kept[i + 1]?.sentAt ?? Infinity;
      return { sent: round(seconds(tap.sentAt)), until: round(Math.min(seconds(tap.tappedAt) + REACTION.after, seconds(nextSentAt))), x: tap.x, y: tap.y };
    });
}

export interface Change {
  readonly at: number;
  readonly share: number;
}

export function parseChanges(metadata: string): readonly Change[] {
  const changes: Change[] = [];
  let at: number | null = null;
  for (const line of metadata.split('\n')) {
    const time = /pts_time:([\d.]+)/.exec(line);
    const average = /lavfi\.signalstats\.YAVG=([\d.]+)/.exec(line);
    if (time !== null) at = Number(time[1]);
    if (average !== null && at !== null) changes.push({ at, share: Number(average[1]) / 255 });
  }
  return changes;
}

export function reactionAt(changes: readonly Change[], tap: TapWindow): number | null {
  const moved = changes.filter((change) => change.share >= REACTION.share).map((change) => change.at);
  const first = moved.findIndex((at) => at >= tap.sent);
  const at = moved[first];
  return at !== undefined && at <= tap.until && (first === 0 || at - moved[first - 1]! >= REACTION.stillFor) ? at : null;
}

export const pulseAt = (tap: TapWindow, reaction: number | null): number => round(Math.max(0, reaction === null ? tap.sent : reaction - PULSE.leadSeconds));

function reactionFilter(tap: TapWindow, viewport: Viewport): string {
  const fx = tap.x / viewport.width;
  const fy = tap.y / viewport.height;
  return [
    `trim=end=${tap.until}`,
    `crop=w=iw*${REACTION.width}:h=ih*${REACTION.height}:x=max(0\\,min(iw-ow\\,iw*${fx}-ow/2)):y=max(0\\,min(ih-oh\\,ih*${fy}-oh/2))`,
    'scale=96:32,format=gray,tblend=all_mode=difference',
    `lut=c0='if(gt(val\\,${REACTION.level})\\,255\\,0)'`,
    'signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG:file=-',
  ].join(',');
}

export async function evidenceTapsOf(video: EvidencePath, taps: readonly TapWindow[], viewport: Viewport, runner: Runner): Promise<readonly EvidenceTap[]> {
  const drawn: EvidenceTap[] = [];
  for (const tap of taps) {
    const from = Math.max(0, tap.sent - 1);
    const scan = await runner('ffmpeg', ['-hide_banner', '-nostats', '-v', 'error', '-noaccurate_seek', '-ss', String(from), '-copyts', ...readByPresentationTime(video), '-an', '-vf', reactionFilter(tap, viewport), '-f', 'null', '-']);
    drawn.push({ at: pulseAt(tap, scan.code === 0 ? reactionAt(parseChanges(scan.stdout), tap) : null), x: tap.x, y: tap.y });
  }
  return drawn;
}

const round = (seconds: number): number => Math.round(seconds * 1000) / 1000;

function merged(spans: readonly Span[]): Span[] {
  const sorted = [...spans].sort((a, b) => a.from - b.from);
  const out: { from: number; to: number }[] = [];
  for (const span of sorted) {
    const last = out.at(-1);
    if (last !== undefined && span.from <= last.to) last.to = Math.max(last.to, span.to);
    else out.push({ ...span });
  }
  return out;
}

function splitAt(stills: readonly Span[], taps: readonly number[]): readonly Span[] {
  return stills.flatMap((still) => {
    const inside = taps.filter((at) => at > still.from && at < still.to).sort((a, b) => a - b);
    return [still.from, ...inside].map((from, i) => ({ from, to: inside[i] ?? still.to }));
  });
}

export function keptPieces(duration: number, marked: readonly Span[] | null, stillStretches: readonly Span[], taps: readonly number[] = []): readonly Span[] {
  const stills = splitAt(stillStretches, taps);
  const windows = merged(
    merged(
      marked === null ? [{ from: 0, to: duration }] : marked.map((span) => ({ from: Math.max(0, span.from - CUT.contextBefore), to: Math.min(duration, span.to + CUT.contextAfter) })),
    ).map((window) => ({ from: window.from, to: Math.min(duration, Math.max(window.to, ...taps.filter((at) => at >= window.from && at < window.to).map((at) => at + PULSE.seconds))) })),
  ).filter((window) => window.to > window.from);
  const ends = marked === null ? [duration] : marked.map((span) => Math.min(duration, span.to));
  const pieces: Span[] = [];
  for (const window of windows) {
    const cuts = stills
      .map((still) => ({ from: Math.max(still.from, window.from), to: Math.min(still.to, window.to) }))
      .filter((still) => still.to > still.from)
      .map((still) => {
        const holdsTheResult = ends.some((end) => still.from <= end + CUT.contextAfter && still.to >= end - CUT.contextAfter);
        return { from: still.from + (holdsTheResult ? CUT.resultHold : CUT.stillHold), to: still.to };
      })
      .filter((cut) => cut.to > cut.from);
    let at = window.from;
    for (const cut of merged(cuts)) {
      if (cut.from - at >= CUT.shortestPiece) pieces.push({ from: round(at), to: round(cut.from) });
      at = Math.max(at, cut.to);
    }
    if (window.to - at >= CUT.shortestPiece) pieces.push({ from: round(at), to: round(window.to) });
  }
  return pieces;
}

export const lengthOf = (pieces: readonly Span[]): number => round(pieces.reduce((sum, piece) => sum + piece.to - piece.from, 0));

export function parseStills(ffmpegLog: string): { readonly duration: number | null; readonly stills: readonly Span[] } {
  const length = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(ffmpegLog);
  const duration = length === null ? null : Number(length[1]) * 3600 + Number(length[2]) * 60 + Number(length[3]);
  const stills: Span[] = [];
  let start: number | null = null;
  for (const line of ffmpegLog.split('\n')) {
    const began = /freeze_start: ([\d.]+)/.exec(line);
    const ended = /freeze_end: ([\d.]+)/.exec(line);
    if (began !== null) start = Number(began[1]);
    if (ended !== null && start !== null) {
      stills.push({ from: start, to: Number(ended[1]) });
      start = null;
    }
  }
  if (start !== null && duration !== null) stills.push({ from: start, to: duration });
  return { duration, stills };
}

const lastLine = (text: string): string => text.trim().split('\n').at(-1) ?? '';

const STILL_FILTER = `fps=20,scale=360:-2,freezedetect=n=0.0003:d=${CUT.stillAtLeast}`;

const selection = (pieces: readonly Span[]): string =>
  `select='${pieces.map((piece) => `between(t\\,${piece.from}\\,${piece.to})`).join('+')}',setpts=N/${CUT.fps}/TB,scale=trunc(iw/2)*2:trunc(ih/2)*2`;

export const selectFilter = (pieces: readonly Span[]): string => `fps=${CUT.fps},${selection(pieces)}`;

export interface Pulse {
  readonly at: number;
  readonly x: number;
  readonly y: number;
}

export function pulsesIn(pieces: readonly Span[], drawn: NonNullable<EvidenceRecord['evidenceTaps']>, videoWidth: number): readonly Pulse[] {
  const scale = videoWidth / drawn.viewport.width;
  return drawn.taps
    .filter((tap) => pieces.some((piece) => tap.at < piece.to && tap.at + PULSE.seconds > piece.from))
    .map((tap) => ({ at: tap.at, x: Math.round(tap.x * scale), y: Math.round(tap.y * scale) }));
}

export const pulseSize = (videoWidth: number): number => 2 * Math.round((videoWidth * PULSE.widthShare) / 2);

export function drawnFilter(pieces: readonly Span[], pulses: readonly Pulse[], size: number): string {
  const s = PULSE.seconds;
  const disc = `color=c=black@0:s=${size}x${size}:r=${CUT.fps}:d=${s},format=rgba,geq=r=64:g=156:b=255:a='if(lte(hypot(X-W/2\\,Y-H/2)\\,W/2*(0.55+0.45*T/${s}))\\,200*(1-T/${s})\\,0)',split=${pulses.length}${pulses.map((_, i) => `[p${i}]`).join('')}`;
  const timed = pulses.map((pulse, i) => `[p${i}]setpts=PTS-STARTPTS+${pulse.at}/TB[q${i}]`);
  const drawn = pulses.map((pulse, i) => `[v${i}][q${i}]overlay=x=${pulse.x - size / 2}:y=${pulse.y - size / 2}:eof_action=pass[v${i + 1}]`);
  return [disc, ...timed, `[0:v]fps=${CUT.fps}[v0]`, ...drawn, `[v${pulses.length}]${selection(pieces)}[out]`].join(';');
}

export function parseWidth(ffmpegLog: string): number | null {
  const size = /Stream #\d+:\d+.*Video: .*?, (\d{2,5})x\d{2,5}\b/.exec(ffmpegLog);
  return size === null ? null : Number(size[1]);
}

export type VideoCut =
  | { readonly kind: 'cut'; readonly path: EvidencePath; readonly from: number; readonly to: number; readonly pieces: readonly Span[]; readonly taps: number }
  | { readonly kind: 'uncut'; readonly path: EvidencePath; readonly why: string };

export async function cutVideo(video: EvidencePath, spans: readonly EvidenceSpan[] | null, runner: Runner, taps: EvidenceRecord['evidenceTaps'] = null): Promise<VideoCut> {
  const uncut = (why: string): VideoCut => ({ kind: 'uncut', path: video, why });
  const scan = await runner('ffmpeg', ['-hide_banner', '-nostats', ...readByPresentationTime(video), '-an', '-vf', STILL_FILTER, '-f', 'null', '-']);
  if (scan.code === 127) return uncut('ffmpeg is not installed');
  if (scan.code !== 0) return uncut(`ffmpeg could not read the video: ${lastLine(scan.stderr)}`);
  const { duration, stills } = parseStills(scan.stderr);
  if (duration === null) return uncut('ffmpeg did not report the length of the video');
  const pieces = keptPieces(duration, spans, stills, taps?.taps.map((tap) => tap.at) ?? []);
  if (pieces.length === 0) return uncut('no part of the video is left after the cut');
  const out = join(video, '..', 'video-cut.mp4') as EvidencePath;
  rmSync(out, { force: true });
  const width = parseWidth(scan.stderr);
  const pulses = taps === null || width === null ? [] : pulsesIn(pieces, taps, width);
  const filter = pulses.length === 0 ? ['-vf', selectFilter(pieces)] : ['-filter_complex', drawnFilter(pieces, pulses, pulseSize(width!)), '-map', '[out]'];
  const encode = await runner('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...readByPresentationTime(video), '-an', ...filter, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  if (encode.code !== 0 || !existsSync(out)) return uncut(`ffmpeg could not write the cut: ${lastLine(encode.stderr) || `exit ${encode.code}`}`);
  return { kind: 'cut', path: out, from: duration, to: lengthOf(pieces), pieces, taps: pulses.length };
}
