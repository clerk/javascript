import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { EvidenceMark } from '../../specs/support/evidence.ts';
import type { Runner } from './exec.ts';
import type { EvidencePath, EvidenceSpan } from './types.ts';

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

export function spansOfMarks(marks: readonly EvidenceMark[], videoStartedAt: number): readonly EvidenceSpan[] {
  return marks
    .map((mark) => ({ label: mark.label, from: (mark.startedAt - videoStartedAt) / 1000, to: (mark.endedAt - videoStartedAt) / 1000, passed: mark.passed }))
    .filter((span) => span.to > 0)
    .map((span) => ({ ...span, from: Math.max(0, round(span.from)), to: round(span.to) }));
}

export function readMarks(file: string): readonly EvidenceMark[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as EvidenceMark);
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

export function keptPieces(duration: number, marked: readonly Span[] | null, stills: readonly Span[]): readonly Span[] {
  const windows = merged(
    marked === null ? [{ from: 0, to: duration }] : marked.map((span) => ({ from: Math.max(0, span.from - CUT.contextBefore), to: Math.min(duration, span.to + CUT.contextAfter) })),
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

export const selectFilter = (pieces: readonly Span[]): string =>
  `fps=${CUT.fps},select='${pieces.map((piece) => `between(t\\,${piece.from}\\,${piece.to})`).join('+')}',setpts=N/${CUT.fps}/TB,scale=trunc(iw/2)*2:trunc(ih/2)*2`;

export type VideoCut =
  | { readonly kind: 'cut'; readonly path: EvidencePath; readonly from: number; readonly to: number; readonly pieces: readonly Span[] }
  | { readonly kind: 'uncut'; readonly path: EvidencePath; readonly why: string };

export async function cutVideo(video: EvidencePath, spans: readonly EvidenceSpan[] | null, runner: Runner): Promise<VideoCut> {
  const uncut = (why: string): VideoCut => ({ kind: 'uncut', path: video, why });
  const scan = await runner('ffmpeg', ['-hide_banner', '-nostats', '-i', video, '-an', '-vf', STILL_FILTER, '-f', 'null', '-']);
  if (scan.code === 127) return uncut('ffmpeg is not installed');
  if (scan.code !== 0) return uncut(`ffmpeg could not read the video: ${lastLine(scan.stderr)}`);
  const { duration, stills } = parseStills(scan.stderr);
  if (duration === null) return uncut('ffmpeg did not report the length of the video');
  const pieces = keptPieces(duration, spans, stills);
  if (pieces.length === 0) return uncut('no part of the video is left after the cut');
  const out = join(video, '..', 'video-cut.mp4') as EvidencePath;
  rmSync(out, { force: true });
  const encode = await runner('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', video, '-an', '-vf', selectFilter(pieces), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  if (encode.code !== 0 || !existsSync(out)) return uncut(`ffmpeg could not write the cut: ${lastLine(encode.stderr) || `exit ${encode.code}`}`);
  return { kind: 'cut', path: out, from: duration, to: lengthOf(pieces), pieces };
}
