import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { evidenceBlock, tapMarker } from '../specs/support/evidence.ts';
import { run } from '../src/core/exec.ts';
import { cutVideo, drawnFilter, keptPieces, lengthOf, parseStills, parseWidth, pulseSize, pulsesIn, readMarks, readTaps, selectFilter, spansOfMarks, tapsOfMarks } from '../src/core/video.ts';
import type { EvidencePath } from '../src/core/types.ts';

const FFMPEG = await run('ffmpeg', ['-version']);

describe('the part of a video that attach posts', () => {
  it('is the marked span with a second before it and half a second after, with a long still inside it shortened to one second', () => {
    const pieces = keptPieces(60, [{ from: 20, to: 30 }], [
      { from: 0, to: 5 },
      { from: 22, to: 26 },
      { from: 28.5, to: 31 },
    ]);
    assert.deepEqual(pieces, [
      { from: 19, to: 23 },
      { from: 26, to: 30.5 },
    ]);
    assert.equal(lengthOf(pieces), 8.5);
  });

  it('keeps two seconds of the still that ends a span, because that is the result a reviewer reads', () => {
    assert.deepEqual(keptPieces(60, [{ from: 20, to: 30 }], [{ from: 25, to: 31 }]), [{ from: 19, to: 27 }]);
  });

  it('is every marked span in order, joined where their context overlaps', () => {
    assert.deepEqual(keptPieces(60, [{ from: 40, to: 45 }, { from: 10, to: 12 }, { from: 12.8, to: 14 }], []), [
      { from: 9, to: 14.5 },
      { from: 39, to: 45.5 },
    ]);
  });

  it('is the whole video, each long still shortened, when the run marks nothing', () => {
    assert.deepEqual(keptPieces(10, null, [{ from: 2, to: 7 }, { from: 8.5, to: 10 }]), [
      { from: 0, to: 3 },
      { from: 7, to: 10 },
    ]);
  });
});

describe('taps in the part of a video that attach posts', () => {
  it('keep the moment each tap lands: a long still is cut before the tap and after it, never across it', () => {
    assert.deepEqual(keptPieces(60, [{ from: 20, to: 30 }], [{ from: 21, to: 27 }], [25.4]), [
      { from: 19, to: 22 },
      { from: 25.4, to: 26.4 },
      { from: 27, to: 30.5 },
    ]);
  });

  it('keep a tap at the very end of a still, and reach past a tap at the end of a block by the length of its pulse', () => {
    assert.deepEqual(keptPieces(60, [{ from: 20, to: 30 }], [{ from: 21, to: 27 }], [26.99]), [
      { from: 19, to: 22 },
      { from: 26.99, to: 30.5 },
    ]);
    assert.deepEqual(keptPieces(60, [{ from: 20, to: 30 }], [{ from: 25, to: 40 }], [30.47]), [
      { from: 19, to: 27 },
      { from: 30.47, to: 30.97 },
    ]);
  });

  it('are drawn when they land in a kept piece or pulse into one, at video pixels scaled from the points of the screen', () => {
    const drawn = { viewport: { width: 420, height: 912 }, taps: [{ at: 3, x: 210, y: 450 }, { at: 9.8, x: 100, y: 100 }, { at: 14, x: 10, y: 10 }] };
    assert.deepEqual(pulsesIn([{ from: 2, to: 5 }, { from: 10, to: 12 }], drawn, 1260), [
      { at: 3, x: 630, y: 1350 },
      { at: 9.8, x: 300, y: 300 },
    ]);
    assert.equal(pulseSize(1260), 126);
    assert.equal(pulseSize(720), 72);
  });

  it('pulse through one overlay each, on the 30 fps timeline before the pieces are selected', () => {
    assert.equal(
      drawnFilter([{ from: 2, to: 5 }], [{ at: 3, x: 630, y: 1350 }], 126),
      "color=c=black@0:s=126x126:r=30:d=0.5,format=rgba,geq=r=64:g=156:b=255:a='if(lte(hypot(X-W/2\\,Y-H/2)\\,W/2*(0.55+0.45*T/0.5))\\,200*(1-T/0.5)\\,0)',split=1[p0];" +
        '[p0]setpts=PTS-STARTPTS+3/TB[q0];[0:v]fps=30[v0];[v0][q0]overlay=x=567:y=1287:eof_action=pass[v1];' +
        "[v1]select='between(t\\,2\\,5)',setpts=N/30/TB,scale=trunc(iw/2)*2:trunc(ih/2)*2[out]",
    );
  });

  it('take the width of the video from the stream line ffmpeg prints', () => {
    const log = '  Stream #0:0[0x1](und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709, progressive), 1260x2736, 1093 kb/s, 30.88 fps';
    assert.equal(parseWidth(log), 1260);
    assert.equal(parseWidth('  Duration: 00:01:03.52'), null);
  });
});

describe('the still stretches ffmpeg reports', () => {
  it('are read from freezedetect with the length of the video, and a still that runs to the end closes there', () => {
    const log = [
      '  Duration: 00:01:03.52, start: 0.000000, bitrate: 1093 kb/s',
      '[freezedetect @ 0x1] lavfi.freezedetect.freeze_start: 3.3',
      '[freezedetect @ 0x1] lavfi.freezedetect.freeze_duration: 2.1',
      '[freezedetect @ 0x1] lavfi.freezedetect.freeze_end: 5.4',
      '[freezedetect @ 0x1] lavfi.freezedetect.freeze_start: 62.15',
    ].join('\n');
    assert.deepEqual(parseStills(log), { duration: 63.52, stills: [{ from: 3.3, to: 5.4 }, { from: 62.15, to: 63.52 }] });
  });
});

describe('the ffmpeg filter that keeps the pieces', () => {
  it('selects each piece and lays the frames end to end at 30 fps', () => {
    assert.equal(
      selectFilter([{ from: 19, to: 23 }, { from: 26, to: 30.5 }]),
      "fps=30,select='between(t\\,19\\,23)+between(t\\,26\\,30.5)',setpts=N/30/TB,scale=trunc(iw/2)*2:trunc(ih/2)*2",
    );
  });
});

describe('marks of host.evidence', () => {
  it('become spans in seconds of the video, and a mark that ended before the video started is dropped', () => {
    const started = Date.parse('2026-10-14T23:00:00.000Z');
    const marks = [
      { label: 'before the video', startedAt: started - 5_000, endedAt: started - 1_000, passed: true },
      { label: 'the list after create', startedAt: started + 5_100, endedAt: started + 19_150, passed: true },
      { label: 'fails on the old build', startedAt: started + 20_000, endedAt: started + 41_000, passed: false },
    ];
    assert.deepEqual(spansOfMarks(marks, started), [
      { label: 'the list after create', from: 5.1, to: 19.15, passed: true },
      { label: 'fails on the old build', from: 20, to: 41, passed: false },
    ]);
  });

  it('are written by the block when the run records evidence, after a hold on the result, and also when the block fails', async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'verify-marks-')), 'evidence-marks.jsonl');
    let now = 1_000;
    const holds: number[] = [];
    const block = evidenceBlock({ marksFile: file, now: () => now, hold: async (ms) => (holds.push(ms), (now += ms)) });
    assert.equal(await block('the new organization in the list', async () => ((now += 4_000), 'value')), 'value');
    await assert.rejects(block('the list on the old build', async () => ((now += 20_000), Promise.reject(new Error('not visible')))), /not visible/);
    assert.deepEqual(holds, [2_000]);
    assert.deepEqual(readMarks(file), [
      { label: 'the new organization in the list', startedAt: 1_000, endedAt: 7_000, passed: true },
      { label: 'the list on the old build', startedAt: 7_000, endedAt: 27_000, passed: false },
    ]);
  });

  it('are read past a line the test process left half written, so the run is still sealed', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'verify-marks-')), 'evidence-marks.jsonl');
    writeFileSync(file, '{"label":"the list","startedAt":1000,"endedAt":4000,"passed":true}\n{"label":"cut off","startedAt":5\n{"label":7}\n');
    assert.deepEqual(readMarks(file), [{ label: 'the list', startedAt: 1_000, endedAt: 4_000, passed: true }]);
  });

  it('turn into taps at the moment each one landed: on iOS 0.3 s before the tap returned, on Android 80 ms before, and a tap before the video is dropped', () => {
    const started = Date.parse('2026-10-14T23:00:00.000Z');
    const taps = [{ tappedAt: started + 200, x: 1, y: 2 }, { tappedAt: started + 5_300, x: 210, y: 450.5 }];
    assert.deepEqual(tapsOfMarks(taps, started, 'ios'), [{ at: 5, x: 210, y: 450.5 }]);
    assert.deepEqual(tapsOfMarks(taps, started, 'android'), [{ at: 0.12, x: 1, y: 2 }, { at: 5.22, x: 210, y: 450.5 }]);
  });

  it('of a tap are written after the tap returns, at the middle of the box the target had before it, beside the marks of the blocks', async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'verify-marks-')), 'evidence-marks.jsonl');
    let now = 1_000;
    const tapped: string[] = [];
    const mark = tapMarker({ marksFile: file, now: () => now });
    await evidenceBlock({ marksFile: file, now: () => now, hold: async () => undefined })('the list', async () => {
      await mark({ boundingBox: async () => ({ x: 100, y: 400, width: 220, height: 44 }) }, async () => void (tapped.push('row'), (now += 450)));
      await mark({ boundingBox: async () => null }, async () => void tapped.push('no box'));
      await assert.rejects(mark({ boundingBox: async () => ({ x: 0, y: 0, width: 10, height: 10 }) }, async () => Promise.reject(new Error('covered'))), /covered/);
    });
    assert.deepEqual(tapped, ['row', 'no box']);
    assert.deepEqual(readTaps(file), [{ tappedAt: 1_450, x: 210, y: 422 }]);
    assert.deepEqual(readMarks(file), [{ label: 'the list', startedAt: 1_000, endedAt: 1_450, passed: true }]);
  });

  it('of a tap are not written, and the box is not read, in a run that records no evidence', async () => {
    let read = false;
    let tapped = false;
    await tapMarker({ marksFile: null, now: () => 0 })({ boundingBox: async () => ((read = true), null) }, async () => void (tapped = true));
    assert.deepEqual({ read, tapped }, { read: false, tapped: true });
  });

  it('are not written, and nothing waits, in a run that records no evidence', async () => {
    const holds: number[] = [];
    const block = evidenceBlock({ marksFile: null, now: () => 0, hold: async (ms) => holds.push(ms) });
    assert.equal(await block('anything', async () => 7), 7);
    assert.deepEqual(holds, []);
    await assert.rejects(block(' ', async () => 7), /host\.evidence needs a label/);
  });
});

describe('cutVideo', () => {
  it('posts the original and says why when ffmpeg is not installed', async () => {
    const video = '/runs/r/video.mp4' as EvidencePath;
    const cut = await cutVideo(video, null, async () => ({ code: 127, stdout: '', stderr: 'spawn ffmpeg ENOENT' }));
    assert.deepEqual(cut, { kind: 'uncut', path: video, why: 'ffmpeg is not installed' });
  });

  it('cuts a real video to its marked span and shortens its stills', { skip: FFMPEG.code === 0 ? false : 'ffmpeg is not installed on this machine' }, async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-cut-'));
    const video = join(dir, 'video.mp4') as EvidencePath;
    const made = await run('ffmpeg', [
      '-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x640:rate=30:duration=4', '-f', 'lavfi', '-i', 'color=c=gray:size=320x640:rate=30:duration=6', '-f', 'lavfi', '-i', 'testsrc2=size=320x640:rate=30:duration=4',
      '-filter_complex', '[0:v][1:v][2:v]concat=n=3:v=1:a=0', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', video,
    ]);
    assert.equal(made.code, 0, made.stderr);
    const cut = await cutVideo(video, [{ label: 'the change', from: 2, to: 12, passed: true }], run);
    assert.equal(cut.kind, 'cut', cut.kind === 'uncut' ? cut.why : '');
    assert.ok(cut.kind === 'cut');
    assert.deepEqual(cut.pieces, [{ from: 1, to: 5 }, { from: 10, to: 12.5 }]);
    const probed = await run('ffmpeg', ['-hide_banner', '-i', cut.path, '-f', 'null', '-']);
    const seconds = parseStills(probed.stderr).duration;
    assert.ok(seconds !== null && Math.abs(seconds - 6.5) < 0.2, `the cut is ${seconds} s long`);
    assert.ok(readFileSync(video).length > 0, 'the original stays in the run directory');
  });

  it('draws a pulse where a tap landed, from the moment it landed, and nowhere else', { skip: FFMPEG.code === 0 ? false : 'ffmpeg is not installed on this machine' }, async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-taps-'));
    const video = join(dir, 'video.mp4') as EvidencePath;
    const made = await run('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=300x600:rate=30:duration=3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', video]);
    assert.equal(made.code, 0, made.stderr);
    const spans = [{ label: 'the change', from: 0.5, to: 2.5, passed: true }];
    const gray = async (cut: string, at: number, x: number, y: number): Promise<number> => {
      const shown = await run('ffmpeg', ['-hide_banner', '-ss', String(at), '-i', cut, '-frames:v', '1', '-vf', `crop=4:4:${x - 2}:${y - 2},format=gray,showinfo`, '-f', 'null', '-']);
      return Number(/mean:\[(\d+)/.exec(shown.stderr)?.[1] ?? -1);
    };
    const plain = await cutVideo(video, spans, run, { viewport: { width: 100, height: 200 }, taps: [] });
    assert.ok(plain.kind === 'cut' && plain.taps === 0);
    const plainCopy = join(dir, 'plain.mp4');
    writeFileSync(plainCopy, readFileSync(plain.path));
    const drawn = await cutVideo(video, spans, run, { viewport: { width: 100, height: 200 }, taps: [{ at: 1.5, x: 8, y: 100 }] });
    assert.ok(drawn.kind === 'cut' && drawn.taps === 1, JSON.stringify(drawn));
    const differs = async (at: number, x: number, y: number) => Math.abs((await gray(drawn.path, at, x, y)) - (await gray(plainCopy, at, x, y))) > 20;
    assert.equal(await differs(1.4, 24, 300), false, 'no pulse before the tap');
    assert.equal(await differs(1.6, 24, 300), true, 'a pulse at the tap point once it landed');
    assert.equal(await differs(1.6, 24, 60), false, 'nothing drawn away from the tap');
    assert.equal(await differs(2.2, 24, 300), false, 'the pulse is gone half a second later');
  });
});
