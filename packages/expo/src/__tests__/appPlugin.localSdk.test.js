import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS plugin, no ESM export
const {
  CLERK_ANDROID_LOCAL_SDK_PATH_ENV,
  CLERK_IOS_LOCAL_SDK_PATH_ENV,
  CLERK_IOS_VERSION,
  applyClerkAndroidMavenLocalRepository,
  configureClerkIosSdkPackage,
  getConfiguredClerkAndroidSdkPath,
  getConfiguredClerkIosSdkPath,
  getMissingClerkAndroidMavenArtifacts,
  getRequiredClerkAndroidMavenArtifacts,
  resolveClerkAndroidSdkPath,
  resolveClerkIosSdkPath,
} = require('../../plugin/localNativeSdk.js');

describe('clerk-ios SDK path helpers', () => {
  afterEach(() => {
    delete process.env[CLERK_IOS_LOCAL_SDK_PATH_ENV];
  });

  test('reads the local clerk-ios path from the env var', () => {
    process.env[CLERK_IOS_LOCAL_SDK_PATH_ENV] = 'env-path';

    expect(getConfiguredClerkIosSdkPath()).toBe('env-path');
  });

  test('resolves a local clerk-ios path from the Expo app root to the iOS project root', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-plugin-'));
    const projectRoot = path.join(workspaceRoot, 'app');
    const platformProjectRoot = path.join(projectRoot, 'ios');
    const clerkIosRoot = path.join(workspaceRoot, 'clerk-ios');

    fs.mkdirSync(platformProjectRoot, { recursive: true });
    fs.mkdirSync(clerkIosRoot, { recursive: true });
    fs.writeFileSync(path.join(clerkIosRoot, 'Package.swift'), '');

    process.env[CLERK_IOS_LOCAL_SDK_PATH_ENV] = '../clerk-ios';

    expect(resolveClerkIosSdkPath({ modRequest: { projectRoot, platformProjectRoot } })).toMatchObject({
      absolutePath: clerkIosRoot,
      relativePath: '../../clerk-ios',
    });
  });

  test('throws when a configured local clerk-ios path does not exist', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-plugin-'));
    const platformProjectRoot = path.join(projectRoot, 'ios');
    fs.mkdirSync(platformProjectRoot, { recursive: true });

    expect(() => {
      process.env[CLERK_IOS_LOCAL_SDK_PATH_ENV] = './missing-clerk-ios';
      resolveClerkIosSdkPath({ modRequest: { projectRoot, platformProjectRoot } });
    }).toThrow('Clerk iOS SDK path does not exist');
  });

  test('throws when a configured local clerk-ios path is not a Swift package', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-plugin-'));
    const platformProjectRoot = path.join(projectRoot, 'ios');
    const clerkIosRoot = path.join(projectRoot, 'clerk-ios');
    fs.mkdirSync(platformProjectRoot, { recursive: true });
    fs.mkdirSync(clerkIosRoot, { recursive: true });

    expect(() => {
      process.env[CLERK_IOS_LOCAL_SDK_PATH_ENV] = './clerk-ios';
      resolveClerkIosSdkPath({ modRequest: { projectRoot, platformProjectRoot } });
    }).toThrow('must point to a Swift package with Package.swift');
  });

  test('configures the iOS Swift package as remote by default and local when provided', () => {
    let nextUuid = 0;
    const xcodeProject = {
      generateUuid: () => `UUID_${++nextUuid}`,
      hash: {
        project: {
          objects: {
            PBXProject: {
              PROJECT_UUID: {},
            },
            PBXNativeTarget: {
              APP_TARGET_UUID: {},
              CLERK_EXPO_TARGET_UUID: {
                name: 'ClerkExpo',
              },
            },
          },
        },
      },
    };

    configureClerkIosSdkPackage(xcodeProject, 'APP_TARGET_UUID', null);

    expect(xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference.UUID_1).toMatchObject({
      repositoryURL: 'https://github.com/clerk/clerk-ios.git',
      requirement: {
        kind: 'exactVersion',
        version: CLERK_IOS_VERSION,
      },
    });
    expect(xcodeProject.hash.project.objects.PBXProject.PROJECT_UUID.packageReferences).toEqual([
      {
        value: 'UUID_1',
        comment: 'clerk-ios',
      },
    ]);
    expect(xcodeProject.hash.project.objects.PBXNativeTarget.APP_TARGET_UUID.packageProductDependencies).toEqual([
      {
        value: 'UUID_2',
        comment: 'ClerkKit',
      },
      {
        value: 'UUID_3',
        comment: 'ClerkKitUI',
      },
    ]);

    configureClerkIosSdkPackage(xcodeProject, 'APP_TARGET_UUID', {
      relativePath: '../../clerk-ios',
    });

    expect(xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference.UUID_1).toBeUndefined();
    expect(xcodeProject.hash.project.objects.XCLocalSwiftPackageReference.UUID_1).toMatchObject({
      relativePath: '../../clerk-ios',
    });
    expect(xcodeProject.hash.project.objects.PBXNativeTarget.APP_TARGET_UUID.packageProductDependencies).toHaveLength(
      2,
    );
  });
});

describe('clerk-android SDK path helpers', () => {
  afterEach(() => {
    delete process.env[CLERK_ANDROID_LOCAL_SDK_PATH_ENV];
  });

  test('reads the local clerk-android path from the env var', () => {
    process.env[CLERK_ANDROID_LOCAL_SDK_PATH_ENV] = 'env-path';

    expect(getConfiguredClerkAndroidSdkPath()).toBe('env-path');
  });

  test('resolves a local clerk-android path from the Expo app root to the Android project root', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-plugin-'));
    const projectRoot = path.join(workspaceRoot, 'app');
    const platformProjectRoot = path.join(projectRoot, 'android');
    const clerkAndroidRoot = path.join(workspaceRoot, 'clerk-android');

    fs.mkdirSync(platformProjectRoot, { recursive: true });
    fs.mkdirSync(path.join(clerkAndroidRoot, 'source', 'api'), { recursive: true });
    fs.mkdirSync(path.join(clerkAndroidRoot, 'source', 'ui'), { recursive: true });
    fs.writeFileSync(path.join(clerkAndroidRoot, 'settings.gradle.kts'), '');
    fs.writeFileSync(
      path.join(clerkAndroidRoot, 'gradle.properties'),
      'CLERK_API_VERSION=1.0.28\nCLERK_TELEMETRY_VERSION=1.0.6\nCLERK_UI_VERSION=1.0.28\n',
    );
    fs.writeFileSync(path.join(clerkAndroidRoot, 'source', 'api', 'build.gradle.kts'), '');
    fs.writeFileSync(path.join(clerkAndroidRoot, 'source', 'ui', 'build.gradle.kts'), '');
    process.env[CLERK_ANDROID_LOCAL_SDK_PATH_ENV] = '../clerk-android';

    expect(
      resolveClerkAndroidSdkPath({ modRequest: { projectRoot, platformProjectRoot } }, { skipMavenLocalCheck: true }),
    ).toMatchObject({
      absolutePath: clerkAndroidRoot,
      relativePath: '../../clerk-android',
    });
  });

  test('throws when a configured local clerk-android path does not exist', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-plugin-'));
    const platformProjectRoot = path.join(projectRoot, 'android');
    fs.mkdirSync(platformProjectRoot, { recursive: true });

    expect(() => {
      process.env[CLERK_ANDROID_LOCAL_SDK_PATH_ENV] = './missing-clerk-android';
      resolveClerkAndroidSdkPath({ modRequest: { projectRoot, platformProjectRoot } });
    }).toThrow('Clerk Android SDK path does not exist');
  });

  test('throws when a configured local clerk-android path is not the expected Gradle project', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-plugin-'));
    const platformProjectRoot = path.join(projectRoot, 'android');
    const clerkAndroidRoot = path.join(projectRoot, 'clerk-android');
    fs.mkdirSync(platformProjectRoot, { recursive: true });
    fs.mkdirSync(clerkAndroidRoot, { recursive: true });

    expect(() => {
      process.env[CLERK_ANDROID_LOCAL_SDK_PATH_ENV] = './clerk-android';
      resolveClerkAndroidSdkPath({ modRequest: { projectRoot, platformProjectRoot } });
    }).toThrow('must point to a Gradle project with settings.gradle.kts');
  });

  test('reports missing local clerk-android Maven artifacts without blocking path resolution', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-plugin-'));
    const projectRoot = path.join(workspaceRoot, 'app');
    const platformProjectRoot = path.join(projectRoot, 'android');
    const clerkAndroidRoot = path.join(workspaceRoot, 'clerk-android');
    const mavenLocalRepositoryRoot = path.join(workspaceRoot, '.m2', 'repository');

    fs.mkdirSync(platformProjectRoot, { recursive: true });
    fs.mkdirSync(path.join(clerkAndroidRoot, 'source', 'api'), { recursive: true });
    fs.mkdirSync(path.join(clerkAndroidRoot, 'source', 'ui'), { recursive: true });
    fs.writeFileSync(path.join(clerkAndroidRoot, 'settings.gradle.kts'), '');
    fs.writeFileSync(
      path.join(clerkAndroidRoot, 'gradle.properties'),
      'CLERK_API_VERSION=1.0.28\nCLERK_TELEMETRY_VERSION=1.0.6\nCLERK_UI_VERSION=1.0.28\n',
    );
    fs.writeFileSync(path.join(clerkAndroidRoot, 'source', 'api', 'build.gradle.kts'), '');
    fs.writeFileSync(path.join(clerkAndroidRoot, 'source', 'ui', 'build.gradle.kts'), '');
    process.env[CLERK_ANDROID_LOCAL_SDK_PATH_ENV] = '../clerk-android';

    expect(getMissingClerkAndroidMavenArtifacts(clerkAndroidRoot, { mavenLocalRepositoryRoot })).toHaveLength(3);

    for (const artifact of getRequiredClerkAndroidMavenArtifacts(clerkAndroidRoot, { mavenLocalRepositoryRoot })) {
      fs.mkdirSync(path.dirname(artifact.path), { recursive: true });
      fs.writeFileSync(artifact.path, '');
    }

    expect(
      resolveClerkAndroidSdkPath({ modRequest: { projectRoot, platformProjectRoot } }, { mavenLocalRepositoryRoot }),
    ).toMatchObject({
      absolutePath: clerkAndroidRoot,
      relativePath: '../../clerk-android',
    });
    expect(getMissingClerkAndroidMavenArtifacts(clerkAndroidRoot, { mavenLocalRepositoryRoot })).toHaveLength(0);
  });

  test('adds mavenLocal to the Android root build.gradle repositories', () => {
    const contents = `allprojects {\n  repositories {\n    google()\n    mavenCentral()\n  }\n}\n`;

    expect(
      applyClerkAndroidMavenLocalRepository(contents, {
        relativePath: '../../clerk-android',
      }),
    ).toContain(`repositories {
    // Clerk: local clerk-android Maven repository start
    mavenLocal()
    // Clerk: local clerk-android Maven repository end
    google()`);
  });

  test('replaces and removes the generated mavenLocal repository block', () => {
    const initialContents = applyClerkAndroidMavenLocalRepository(
      `allprojects {\n  repositories {\n    google()\n  }\n}\n`,
      {
        relativePath: '../../clerk-android',
      },
    );
    const replacedContents = applyClerkAndroidMavenLocalRepository(initialContents, {
      relativePath: '../../clerk-android',
    });

    expect((replacedContents.match(/mavenLocal\(\)/g) || []).length).toBe(1);
    expect(applyClerkAndroidMavenLocalRepository(replacedContents, null)).toBe(
      `allprojects {\n  repositories {\n    google()\n  }\n}\n`,
    );
  });
});
