import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import {
  artifact,
  buildFixture,
  buildInputs,
  buildStandalone,
  locateNativeBuild,
  nativeCacheDir,
  nativeProjectKey,
  type FixtureSite,
} from '../src/fixture.ts';
import { VerifyFailure } from '../src/core/types.ts';
import { nativeFingerprint } from '../src/native-build.ts';

const hermes = (version: number, body: string): Buffer => {
  const header = Buffer.alloc(12);
  Buffer.from('c61fbc03c103191f', 'hex').copy(header);
  header.writeUInt32LE(version, 8);
  return Buffer.concat([header, Buffer.from(body)]);
};

const lockfile = (versions: Readonly<Record<string, string>>): string =>
  [
    "lockfileVersion: '9.0'",
    'packages:',
    ...Object.entries(versions).map(([name, version]) => `  ${name.startsWith('@') ? `'${name}@${version}'` : `${name}@${version}`}:`),
    'snapshots:',
    ...Object.entries(versions).map(([name, version]) => `  '${name}@${version}(@babel/core@7.29.7)': {}`),
  ].join('\n');

const LOCKED = {
  expo: '57.0.23',
  'expo-modules-core': '57.0.21',
  '@expo/config-plugins': '57.0.10',
  'react-native': '0.86.0',
  'electron-to-chromium': '1.5.447',
  '@babel/core': '7.29.7',
};

interface Linked {
  readonly modulesCore?: string;
  readonly babel?: string;
  readonly config?: string;
  readonly clerkIos?: string;
  readonly generated?: boolean;
}

const expoSources = ({
  modulesCore = '57.0.21',
  babel = '7.29.7',
  config = 'portrait',
  clerkIos = 'aa',
  generated = false,
}: Linked = {}) => {
  const core = `node_modules/.pnpm/expo-modules-core@${modulesCore}_@babel+core@${babel}_react@19.2.8/node_modules/expo-modules-core`;
  return {
    hash: `${modulesCore} ${babel} ${config} ${clerkIos}`,
    sources: [
      { type: 'dir', filePath: '../../../packages/expo-native-components/ios', reasons: ['expoAutolinkingIos'], hash: clerkIos },
      { type: 'dir', filePath: core, reasons: ['expoAutolinkingIos'], hash: null },
      {
        type: 'contents',
        id: 'expoAutolinkingConfig:ios',
        contents: JSON.stringify({ modules: [{ packageName: 'expo-modules-core', pods: [{ podspecDir: core }] }] }),
        reasons: ['expoAutolinkingIos'],
        hash: `${modulesCore} ${babel}`,
      },
      { type: 'contents', id: 'expoConfig', contents: JSON.stringify({ orientation: config }), reasons: ['expoConfig'], hash: config },
      ...(generated ? [{ type: 'dir', filePath: 'ios', reasons: ['bareNativeDir'], hash: null }] : []),
    ],
  };
};

interface Checkout {
  readonly site: FixtureSite;
  readonly cache: string;
  readonly steps: string[];
  readonly write: (file: string, content: string) => void;
  expo: unknown;
  nativeBytecode: number;
  compilerBytecode: number;
}

function checkout(): Checkout {
  const worktree = mkdtempSync(join(tmpdir(), 'verify-expo-native-'));
  const fixture = join(worktree, 'integration', 'templates', 'expo-native');
  const write = (file: string, content: string) => {
    mkdirSync(dirname(join(worktree, file)), { recursive: true });
    writeFileSync(join(worktree, file), content);
  };
  execFileSync('git', ['init', '-q', worktree]);
  mkdirSync(join(worktree, 'node_modules'));
  write('integration/templates/expo-native/package.sdk-57.json', '{"main":"index.js"}');
  write('integration/templates/expo-native/.gitignore', '/ios/\n/node_modules/\n/package.json\n/pnpm-lock.yaml\n');
  write('integration/templates/expo-native/index.js', 'screen one');
  write('packages/expo-native-components/ios/ClerkExpo.swift', 'native one');
  write('packages/expo/src/index.ts', 'js one');
  const steps: string[] = [];
  const app = artifact('ios', 'standalone', fixture);
  const state: Checkout = {
    site: {
      worktree,
      fixture,
      must: async () => undefined,
      toolchain: async () => 'Xcode 26.4',
      expoFingerprint: async () => {
        if (state.expo instanceof Error) throw state.expo;
        return state.expo;
      },
    },
    cache: join(worktree, 'cache'),
    steps,
    write,
    expo: expoSources(),
    nativeBytecode: 98,
    compilerBytecode: 98,
  };
  const must: FixtureSite['must'] = async (what, _command, args) => {
    steps.push(what);
    const js = readFileSync(join(worktree, 'packages/expo/src/index.ts'), 'utf8');
    if (what === 'pnpm add the workspace packages') {
      for (const name of ['react-native', 'hermes-compiler']) {
        mkdirSync(join(fixture, 'node_modules', name), { recursive: true });
        writeFileSync(join(fixture, 'node_modules', name, 'package.json'), '{}');
      }
      writeFileSync(join(fixture, 'pnpm-lock.yaml'), lockfile(LOCKED));
    }
    if (what === 'expo prebuild') {
      rmSync(join(fixture, 'ios'), { recursive: true, force: true });
      mkdirSync(join(fixture, 'ios'));
    }
    if (what === 'xcodebuild') {
      mkdirSync(app, { recursive: true });
      writeFileSync(join(app, 'main.jsbundle'), hermes(state.nativeBytecode, `built with ${js}`));
      writeFileSync(join(app, 'ClerkExpoNativeBuildFixture'), 'binary');
    }
    if (what === 'expo export:embed') writeFileSync(args[args.indexOf('--bundle-output') + 1]!, js);
    if (what === 'hermesc')
      writeFileSync(args[args.indexOf('-out') + 1]!, hermes(state.compilerBytecode, `embedded ${readFileSync(args.at(-1)!, 'utf8')}`));
  };
  return Object.assign(state, { site: { ...state.site, must } });
}

const build = (at: Checkout, nativeCache: string | null = at.cache, nativeKey = "key") =>
  buildFixture(
    { platform: "ios", product: "standalone", nativeKey, buildPackages: false, nativeCache, progress: () => undefined },
    at.site,
  );
const bundleOf = (app: string) => readFileSync(join(app, 'main.jsbundle')).subarray(12).toString();
const NATIVE_BUILD = ['pnpm add the workspace packages', 'expo install', 'expo prebuild', 'xcodebuild'];
const EMBED = ['expo export:embed', 'hermesc'];

describe('the native build that is kept between builds', () => {
  it('is named by the native inputs, the packages that decide the native build, and the toolchain, and by nothing JS-only', async () => {
    const at = checkout();
    const notes: string[] = [];
    const id = async (site: FixtureSite = at.site) => (await locateNativeBuild(at.cache, 'ios', site, line => notes.push(line))).id;
    const lock = (versions: Readonly<Record<string, string>>) =>
      writeFileSync(join(at.site.fixture, 'pnpm-lock.yaml'), lockfile({ ...LOCKED, ...versions }));
    const first = await id();
    assert.match(first, /^ios-[0-9a-f]{16}$/);
    const seen = new Set([first]);
    const holds = async (what: string) => assert.equal(await id(), first, what);
    const moves = async (what: string, site?: FixtureSite) => {
      const next = await id(site);
      assert.equal(seen.has(next), false, what);
      seen.add(next);
    };

    at.write('packages/expo/src/index.ts', 'js two');
    at.write('integration/templates/expo-native/index.js', 'screen two');
    await holds('a JS edit');
    lock({ 'electron-to-chromium': '1.5.446' });
    await holds('another version of a JS-only package');
    lock({ '@babel/core': '7.29.6' });
    at.expo = expoSources({ babel: '7.29.6' });
    await holds('another version of a JS-only package that pnpm names in the directory of a native one');
    lock({});
    at.expo = expoSources({ generated: true });
    await holds('a native project that expo prebuild generated, which Expo lists and does not hash');
    at.expo = expoSources();

    lock({ expo: '57.0.24' });
    await moves('another expo');
    lock({ '@expo/config-plugins': '57.0.9' });
    await moves('another version of a package that generates the native project and links no native code');
    lock({});
    at.expo = expoSources({ modulesCore: '57.0.20' });
    await moves('another version of a linked native package');
    at.expo = expoSources({ config: 'landscape' });
    await moves('another app config');
    at.expo = expoSources({ clerkIos: 'bb' });
    await moves('other native files in a linked workspace package');
    at.expo = expoSources();
    at.write('packages/expo-native-components/ios/ClerkExpo.swift', 'native two');
    await moves('a native edit');
    await moves('another Xcode', { ...at.site, toolchain: async () => 'Xcode 26.5' });
    assert.deepEqual(notes, []);
  });

  it('is named by the whole lockfile, and says why, when what Expo reports cannot be relied on', async () => {
    const at = checkout();
    const notes: string[] = [];
    const id = async () => (await locateNativeBuild(at.cache, 'ios', at.site, line => notes.push(line))).id;
    const lock = (versions: Readonly<Record<string, string>>) =>
      writeFileSync(join(at.site.fixture, 'pnpm-lock.yaml'), lockfile({ ...LOCKED, ...versions }));
    const narrow = await id();
    const android = expoSources().sources.map(source =>
      source.id === 'expoAutolinkingConfig:ios' ? { ...source, id: 'expoAutolinkingConfig:android' } : source,
    );
    const unreliable: readonly (readonly [unknown, RegExp])[] = [
      [new Error("Cannot find module 'expo/package.json'"), /because @expo\/fingerprint did not run: Cannot find module 'expo\/package.json'$/],
      [{ sources: android }, /because @expo\/fingerprint cannot be relied on: it left out expoAutolinkingConfig:ios$/],
      [{ sources: [...expoSources().sources, { type: 'archive', filePath: 'a.zip', hash: 'cc' }] }, /it returned a archive source this CLI cannot read$/],
      [{ hash: 'only a hash' }, /it returned no sources$/],
    ];
    for (const [reported, why] of unreliable) {
      at.expo = reported;
      lock({});
      const wide = await id();
      assert.notEqual(wide, narrow);
      assert.match(notes.at(-1) ?? '', /^build   native fingerprint covers the whole pnpm-lock\.yaml, because /);
      assert.match(notes.at(-1) ?? '', why);
      lock({ 'electron-to-chromium': '1.5.446' });
      assert.notEqual(await id(), wide);
    }
    at.expo = expoSources();
    writeFileSync(join(at.site.fixture, 'pnpm-lock.yaml'), "lockfileVersion: '12.0'\n");
    const unread = await id();
    assert.match(notes.at(-1) ?? '', /because pnpm-lock\.yaml names no Expo or React Native package$/);
    assert.notEqual(unread, narrow);
    rmSync(join(at.site.fixture, 'pnpm-lock.yaml'));
    await assert.rejects(id(), (error: VerifyFailure) => error.code === 'NOT_READY' && /pnpm-lock\.yaml is missing/.test(error.message));
  });

  it('reads the fingerprint from the files as they are on disk, tracked or not', async () => {
    const at = checkout();
    const inputs = { platform: 'ios' as const, worktree: at.site.worktree, inputs: ['packages/expo-native-components/ios'], files: [], toolchain: '', installed: '' };
    const untracked = await nativeFingerprint(inputs);
    at.write('packages/expo-native-components/ios/New.swift', 'added');
    assert.notEqual(await nativeFingerprint(inputs), untracked);
  });

  it('is built once, and a later build with new JS only exports the bundle and puts it in that app', async () => {
    const at = checkout();
    const app = await build(at);
    assert.deepEqual(at.steps, NATIVE_BUILD);
    assert.equal(bundleOf(app), 'built with js one');
    const kept = await locateNativeBuild(at.cache, 'ios', at.site);
    assert.equal(existsSync(kept.app), true);

    at.steps.length = 0;
    at.write('packages/expo/src/index.ts', 'js two');
    const rebuilt = await build(at);
    assert.deepEqual(at.steps, EMBED);
    assert.equal(rebuilt, app);
    assert.equal(bundleOf(rebuilt), 'embedded js two');
    assert.equal(readFileSync(join(rebuilt, 'ClerkExpoNativeBuildFixture'), 'utf8'), 'binary');
    assert.equal(bundleOf(kept.app), 'built with js one');
  });

  it('takes an app that something else put in the cache for the same fingerprint', async () => {
    const at = checkout();
    const kept = await locateNativeBuild(at.cache, 'ios', at.site);
    mkdirSync(kept.app, { recursive: true });
    writeFileSync(join(kept.app, 'main.jsbundle'), hermes(98, 'built elsewhere with other JS'));
    at.steps.length = 0;
    assert.equal(bundleOf(await build(at)), 'embedded js one');
    assert.deepEqual(at.steps, EMBED);
  });

  it('builds natively again when the native inputs changed', async () => {
    const at = checkout();
    await build(at);
    at.steps.length = 0;
    at.write('packages/expo-native-components/ios/ClerkExpo.swift', 'native two');
    await build(at, at.cache, 'key-2');
    assert.deepEqual(at.steps, ['expo prebuild', 'xcodebuild']);
  });

  it('builds natively when the kept app runs another Hermes bytecode than this checkout compiles, and keeps the new app', async () => {
    const at = checkout();
    await build(at);
    at.steps.length = 0;
    at.compilerBytecode = 99;
    at.nativeBytecode = 99;
    const lines: string[] = [];
    const app = await buildFixture(
      { platform: 'ios', product: 'standalone', nativeKey: 'key', buildPackages: false, nativeCache: at.cache, progress: line => lines.push(line) },
      at.site,
    );
    assert.deepEqual(at.steps, [...EMBED, 'xcodebuild']);
    assert.match(lines.join('\n'), /not reused: it runs Hermes bytecode 98, and this checkout compiles 99/);
    assert.equal(bundleOf(app), 'built with js one');
    assert.equal(bundleOf((await locateNativeBuild(at.cache, 'ios', at.site)).app), 'built with js one');
  });

  it('builds natively when the kept app holds no bundle', async () => {
    const at = checkout();
    const kept = await locateNativeBuild(at.cache, 'ios', at.site);
    mkdirSync(kept.app, { recursive: true });
    at.steps.length = 0;
    await build(at);
    assert.deepEqual(at.steps, ['expo prebuild', 'xcodebuild']);
  });

  it('installs the standalone packages again after a dev client build installed its own', async () => {
    const at = checkout();
    const standalone = (await locateNativeBuild(at.cache, 'ios', at.site)).id;
    await buildFixture(
      { platform: 'ios', product: 'dev-client', nativeKey: 'key', buildPackages: false, progress: () => undefined },
      at.site,
    );
    at.steps.length = 0;
    assert.equal((await locateNativeBuild(at.cache, 'ios', at.site)).id, standalone);
    assert.deepEqual(at.steps, ['pnpm add the workspace packages', 'expo install']);
    at.steps.length = 0;
    await locateNativeBuild(at.cache, 'ios', at.site);
    assert.deepEqual(at.steps, []);
  });

  it('is not used without VERIFY_NATIVE_CACHE, and never for a dev client', async () => {
    assert.equal(nativeCacheDir({}), null);
    assert.equal(nativeCacheDir({ VERIFY_NATIVE_CACHE: '' }), null);
    assert.equal(nativeCacheDir({ VERIFY_NATIVE_CACHE: '.verify/native' }, '/work'), '/work/.verify/native');
    assert.equal(nativeCacheDir({ VERIFY_NATIVE_CACHE: '/abs/native' }, '/work'), '/abs/native');
    const at = checkout();
    await build(at, null);
    assert.deepEqual(at.steps, NATIVE_BUILD);
    assert.equal(existsSync(at.cache), false);
    at.steps.length = 0;
    await buildFixture(
      { platform: 'ios', product: 'dev-client', nativeKey: 'key', buildPackages: false, nativeCache: at.cache, progress: () => undefined },
      at.site,
    );
    assert.deepEqual(at.steps, NATIVE_BUILD);
    assert.equal(existsSync(at.cache), false);
    rmSync(at.site.worktree, { recursive: true, force: true });
  });
});

describe('the standalone build that a person or a remote session starts', () => {
  it('installs, builds, says how long each step took, and ends with the path of the app', async () => {
    const at = checkout();
    const said: string[] = [];
    let clock = 0;
    const app = await buildStandalone('ios', 'key', line => said.push(line), at.site, () => (clock += 3000));
    assert.equal(app, artifact('ios', 'standalone', at.site.fixture));
    assert.deepEqual(at.steps, ['pnpm install', 'turbo build', ...NATIVE_BUILD]);
    assert.deepEqual(said, [
      'build   pnpm install --frozen-lockfile',
      'build   pnpm install took 3s',
      'build   turbo build @clerk/expo, @clerk/expo-native-components, @clerk/expo-biometrics, @clerk/expo-google-signin',
      'build   turbo build took 3s',
      'build   pnpm add the workspace packages took 3s',
      'build   expo install took 3s',
      'build   expo prebuild --clean --platform ios',
      'build   expo prebuild took 3s',
      'build   xcodebuild Release (JS embedded)',
      'build   xcodebuild took 3s',
      `build   ${app}`,
    ]);
    rmSync(at.site.worktree, { recursive: true, force: true });
  });

  it('takes the native build kept for these native inputs and embeds only the new JS when a cache is named', async () => {
    const at = checkout();
    const say = () => undefined;
    await buildStandalone('ios', 'key', say, at.site, Date.now, at.cache);
    at.write('packages/expo/src/index.ts', 'js two');
    at.steps.length = 0;
    const app = await buildStandalone('ios', 'key', say, at.site, Date.now, at.cache);
    assert.deepEqual(at.steps, ['pnpm install', 'turbo build', ...EMBED]);
    assert.equal(bundleOf(app), 'embedded js two');
    rmSync(at.site.worktree, { recursive: true, force: true });
  });

  it('says how long a step ran before it failed', async () => {
    const at = checkout();
    const said: string[] = [];
    let clock = 0;
    const site: FixtureSite = {
      ...at.site,
      must: async what => {
        if (what === 'turbo build') throw new VerifyFailure('BUILD_FAILED', 'turbo build exited 1', 'fix it');
      },
    };
    await assert.rejects(
      buildStandalone('ios', 'key', line => said.push(line), site, () => (clock += 3000)),
      { code: 'BUILD_FAILED', message: 'turbo build exited 1' },
    );
    assert.deepEqual(said.slice(-2), [
      'build   turbo build @clerk/expo, @clerk/expo-native-components, @clerk/expo-biometrics, @clerk/expo-google-signin',
      'build   turbo build took 3s',
    ]);
    rmSync(at.site.worktree, { recursive: true, force: true });
  });
});

describe('the native project a remote session generates', () => {
  it('is generated again when uncommitted changes touch a native input, and not for a JS-only change', async () => {
    const at = checkout();
    const worktree = at.site.worktree;
    execFileSync('git', ['-C', worktree, 'add', '-A']);
    execFileSync('git', ['-C', worktree, '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-m', 'base']);
    const committed = await nativeProjectKey('ios', worktree);
    await build(at, null, committed);
    at.write('packages/expo/src/index.ts', 'js two');
    assert.equal(await nativeProjectKey('ios', worktree), committed);
    at.steps.length = 0;
    await build(at, null, committed);
    assert.deepEqual(at.steps, ['xcodebuild']);
    at.write('packages/expo-native-components/ios/ClerkExpo.swift', 'native two');
    const edited = await nativeProjectKey('ios', worktree);
    assert.notEqual(edited, committed);
    at.write('packages/expo-native-components/ios/Added.swift', 'native three');
    const added = await nativeProjectKey('ios', worktree);
    assert.notEqual(added, edited);
    at.steps.length = 0;
    await build(at, null, added);
    assert.deepEqual(at.steps, NATIVE_BUILD);
    rmSync(worktree, { recursive: true, force: true });
  });

  it('is generated again when uncommitted changes touch the root pnpm-lock.yaml, which resolves the config plugins expo prebuild runs', async () => {
    const at = checkout();
    const worktree = at.site.worktree;
    at.write('pnpm-lock.yaml', lockfile({ '@expo/config-plugins': '54.0.4' }));
    execFileSync('git', ['-C', worktree, 'add', '-A']);
    execFileSync('git', ['-C', worktree, '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-m', 'base']);
    await build(at, at.cache, await nativeProjectKey('ios', worktree));
    at.write('pnpm-lock.yaml', lockfile({ '@expo/config-plugins': '54.0.5' }));
    at.steps.length = 0;
    await build(at, at.cache, await nativeProjectKey('ios', worktree));
    assert.deepEqual(at.steps, ['expo prebuild', 'xcodebuild']);
    rmSync(worktree, { recursive: true, force: true });
  });
});

describe('the build key of a standalone app', () => {
  it('covers the JS of every workspace package the test app links, which a dev client leaves to Metro', () => {
    const linked = [
      'packages/expo',
      'packages/expo-native-components',
      'packages/expo-google-signin',
      'packages/expo-biometrics',
    ];
    for (const platform of ['ios', 'android'] as const) {
      const standalone = buildInputs(platform, 'standalone');
      const devClient = buildInputs(platform, 'dev-client');
      assert.deepEqual(
        linked.filter(dir => !standalone.includes(dir)),
        [],
        platform,
      );
      assert.deepEqual(
        linked.filter(dir => devClient.includes(dir)),
        [],
        platform,
      );
    }
  });
});
