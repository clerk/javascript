import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { evidenceBlock } from '../specs/support/evidence.ts';
import { run } from '../src/core/exec.ts';
import { cutVideo, keptPieces, lengthOf, parseStills, readMarks, selectFilter, spansOfMarks } from '../src/core/video.ts';
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
});
