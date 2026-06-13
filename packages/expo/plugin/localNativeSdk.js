const { withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CLERK_IOS_LOCAL_SDK_PATH_ENV = 'CLERK_EXPO_IOS_SDK_PATH';
const CLERK_ANDROID_LOCAL_SDK_PATH_ENV = 'CLERK_EXPO_ANDROID_SDK_PATH';
const CLERK_IOS_REPO = 'https://github.com/clerk/clerk-ios.git';
const CLERK_IOS_VERSION = '1.2.2';
const CLERK_ANDROID_MAVEN_LOCAL_BLOCK_START = '// Clerk: local clerk-android Maven repository start';
const CLERK_ANDROID_MAVEN_LOCAL_BLOCK_END = '// Clerk: local clerk-android Maven repository end';

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function readPropertiesFile(filePath) {
  const properties = {};
  const contents = fs.readFileSync(filePath, 'utf8');

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    properties[trimmed.slice(0, separatorIndex).trim()] = trimmed.slice(separatorIndex + 1).trim();
  }

  return properties;
}

function getConfiguredClerkIosSdkPath() {
  return process.env[CLERK_IOS_LOCAL_SDK_PATH_ENV] || null;
}

function getConfiguredClerkAndroidSdkPath() {
  return process.env[CLERK_ANDROID_LOCAL_SDK_PATH_ENV] || null;
}

function resolveClerkIosSdkPath(config) {
  const configuredPath = getConfiguredClerkIosSdkPath();
  if (!configuredPath) {
    return null;
  }

  const projectRoot = config.modRequest.projectRoot || process.cwd();
  const platformProjectRoot = config.modRequest.platformProjectRoot || path.join(projectRoot, 'ios');
  const absolutePath = path.isAbsolute(configuredPath) ? configuredPath : path.resolve(projectRoot, configuredPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Clerk iOS SDK path does not exist: ${absolutePath}`);
  }

  const packageManifestPath = path.join(absolutePath, 'Package.swift');
  if (!fs.existsSync(packageManifestPath)) {
    throw new Error(`Clerk iOS SDK path must point to a Swift package with Package.swift: ${absolutePath}`);
  }

  return {
    absolutePath,
    relativePath: toPosixPath(path.relative(platformProjectRoot, absolutePath)),
  };
}

function getObjectSection(xcodeProject, sectionName) {
  if (!xcodeProject.hash.project.objects[sectionName]) {
    xcodeProject.hash.project.objects[sectionName] = {};
  }
  return xcodeProject.hash.project.objects[sectionName];
}

function findClerkIosPackageReferenceUuid(xcodeProject) {
  const remoteReferences = xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference || {};
  for (const [uuid, reference] of Object.entries(remoteReferences)) {
    if (reference && reference.repositoryURL === CLERK_IOS_REPO) {
      return uuid;
    }
  }

  const localReferences = xcodeProject.hash.project.objects.XCLocalSwiftPackageReference || {};
  for (const [uuid, reference] of Object.entries(localReferences)) {
    if (reference && path.basename(reference.relativePath || '') === 'clerk-ios') {
      return uuid;
    }
  }

  return null;
}

function setClerkIosPackageReference(xcodeProject, packageUuid, localPackage) {
  const remoteReferences = getObjectSection(xcodeProject, 'XCRemoteSwiftPackageReference');
  const localReferences = getObjectSection(xcodeProject, 'XCLocalSwiftPackageReference');

  delete remoteReferences[packageUuid];
  delete localReferences[packageUuid];

  if (localPackage) {
    localReferences[packageUuid] = {
      isa: 'XCLocalSwiftPackageReference',
      relativePath: localPackage.relativePath,
    };
    return;
  }

  remoteReferences[packageUuid] = {
    isa: 'XCRemoteSwiftPackageReference',
    repositoryURL: CLERK_IOS_REPO,
    requirement: {
      kind: 'exactVersion',
      version: CLERK_IOS_VERSION,
    },
  };
}

function ensureProjectPackageReference(project, packageUuid, packageName) {
  if (!project.packageReferences) {
    project.packageReferences = [];
  }

  if (!project.packageReferences.some(ref => ref.value === packageUuid)) {
    project.packageReferences.push({
      value: packageUuid,
      comment: packageName,
    });
  }
}

function ensureSwiftPackageProductDependency(xcodeProject, packageUuid, productName) {
  const productDependencies = getObjectSection(xcodeProject, 'XCSwiftPackageProductDependency');

  for (const [uuid, dependency] of Object.entries(productDependencies)) {
    if (dependency && dependency.package === packageUuid && dependency.productName === productName) {
      return uuid;
    }
  }

  const productUuid = xcodeProject.generateUuid();
  productDependencies[productUuid] = {
    isa: 'XCSwiftPackageProductDependency',
    package: packageUuid,
    productName,
  };
  return productUuid;
}

function ensureTargetPackageProductDependency(target, productUuid, productName) {
  if (!target.packageProductDependencies) {
    target.packageProductDependencies = [];
  }

  if (!target.packageProductDependencies.some(dep => dep.value === productUuid)) {
    target.packageProductDependencies.push({
      value: productUuid,
      comment: productName,
    });
  }
}

function configureClerkIosSdkPackage(xcodeProject, targetUuid, localPackage) {
  const packageUuid = findClerkIosPackageReferenceUuid(xcodeProject) || xcodeProject.generateUuid();
  setClerkIosPackageReference(xcodeProject, packageUuid, localPackage);

  const productUuidKit = ensureSwiftPackageProductDependency(xcodeProject, packageUuid, 'ClerkKit');
  const productUuidKitUI = ensureSwiftPackageProductDependency(xcodeProject, packageUuid, 'ClerkKitUI');

  const projectSection = xcodeProject.hash.project.objects.PBXProject;
  const projectUuid = Object.keys(projectSection)[0];
  ensureProjectPackageReference(projectSection[projectUuid], packageUuid, 'clerk-ios');

  const nativeTarget = xcodeProject.hash.project.objects.PBXNativeTarget[targetUuid];
  ensureTargetPackageProductDependency(nativeTarget, productUuidKit, 'ClerkKit');
  ensureTargetPackageProductDependency(nativeTarget, productUuidKitUI, 'ClerkKitUI');

  let addedToClerkExpoTarget = false;
  const allTargets = xcodeProject.hash.project.objects.PBXNativeTarget;
  for (const target of Object.values(allTargets)) {
    if (target && target.name === 'ClerkExpo') {
      ensureTargetPackageProductDependency(target, productUuidKit, 'ClerkKit');
      ensureTargetPackageProductDependency(target, productUuidKitUI, 'ClerkKitUI');
      addedToClerkExpoTarget = true;
    }
  }

  return {
    addedToClerkExpoTarget,
    packageUuid,
  };
}

function getExpoClerkAndroidDependencyVersions() {
  const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
  const contents = fs.readFileSync(buildGradlePath, 'utf8');
  const apiVersion = contents.match(/clerkAndroidApiVersion\s*=\s*"([^"]+)"/)?.[1];
  const uiVersion = contents.match(/clerkAndroidUiVersion\s*=\s*"([^"]+)"/)?.[1];

  if (!apiVersion || !uiVersion) {
    throw new Error(`Could not read clerk-android dependency versions from ${buildGradlePath}`);
  }

  return {
    api: apiVersion,
    ui: uiVersion,
  };
}

function getMavenLocalArtifactPath(repositoryRoot, artifactId, version) {
  return path.join(repositoryRoot, 'com', 'clerk', artifactId, version, `${artifactId}-${version}.pom`);
}

function getRequiredClerkAndroidMavenArtifacts(androidSdkPath, options = {}) {
  const versions = getExpoClerkAndroidDependencyVersions();
  const gradleProperties = readPropertiesFile(path.join(androidSdkPath, 'gradle.properties'));
  const telemetryVersion = gradleProperties.CLERK_TELEMETRY_VERSION;

  if (gradleProperties.CLERK_API_VERSION !== versions.api || gradleProperties.CLERK_UI_VERSION !== versions.ui) {
    throw new Error(
      `Local clerk-android versions must match @clerk/expo dependencies. Expected API ${versions.api} and UI ${versions.ui}, but found API ${gradleProperties.CLERK_API_VERSION || 'unknown'} and UI ${gradleProperties.CLERK_UI_VERSION || 'unknown'}.`,
    );
  }

  const repositoryRoot = options.mavenLocalRepositoryRoot || path.join(os.homedir(), '.m2', 'repository');
  const artifacts = [
    {
      name: 'clerk-android-api',
      path: getMavenLocalArtifactPath(repositoryRoot, 'clerk-android-api', versions.api),
    },
    {
      name: 'clerk-android-ui',
      path: getMavenLocalArtifactPath(repositoryRoot, 'clerk-android-ui', versions.ui),
    },
  ];

  if (telemetryVersion) {
    artifacts.push({
      name: 'clerk-android-telemetry',
      path: getMavenLocalArtifactPath(repositoryRoot, 'clerk-android-telemetry', telemetryVersion),
    });
  }

  return artifacts;
}

function getMissingClerkAndroidMavenArtifacts(androidSdkPath, options = {}) {
  return getRequiredClerkAndroidMavenArtifacts(androidSdkPath, options).filter(
    artifact => !fs.existsSync(artifact.path),
  );
}

function resolveClerkAndroidSdkPath(config, options = {}) {
  const configuredPath = getConfiguredClerkAndroidSdkPath();
  if (!configuredPath) {
    return null;
  }

  const projectRoot = config.modRequest.projectRoot || process.cwd();
  const platformProjectRoot = config.modRequest.platformProjectRoot || path.join(projectRoot, 'android');
  const absolutePath = path.isAbsolute(configuredPath) ? configuredPath : path.resolve(projectRoot, configuredPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Clerk Android SDK path does not exist: ${absolutePath}`);
  }

  const settingsGradlePath = path.join(absolutePath, 'settings.gradle.kts');
  if (!fs.existsSync(settingsGradlePath)) {
    throw new Error(`Clerk Android SDK path must point to a Gradle project with settings.gradle.kts: ${absolutePath}`);
  }

  const apiProjectPath = path.join(absolutePath, 'source', 'api', 'build.gradle.kts');
  const uiProjectPath = path.join(absolutePath, 'source', 'ui', 'build.gradle.kts');
  if (!fs.existsSync(apiProjectPath) || !fs.existsSync(uiProjectPath)) {
    throw new Error(`Clerk Android SDK path must contain source/api and source/ui Gradle projects: ${absolutePath}`);
  }

  return {
    absolutePath,
    relativePath: toPosixPath(path.relative(platformProjectRoot, absolutePath)),
  };
}

function getClerkAndroidMavenLocalRepositoryBlock() {
  return `    ${CLERK_ANDROID_MAVEN_LOCAL_BLOCK_START}
    mavenLocal()
    ${CLERK_ANDROID_MAVEN_LOCAL_BLOCK_END}`;
}

function removeClerkAndroidMavenLocalRepositoryBlock(contents) {
  const startIndex = contents.indexOf(CLERK_ANDROID_MAVEN_LOCAL_BLOCK_START);
  if (startIndex === -1) {
    return contents;
  }

  const endIndex = contents.indexOf(CLERK_ANDROID_MAVEN_LOCAL_BLOCK_END, startIndex);
  if (endIndex === -1) {
    return contents;
  }

  const lineStartIndex = contents.lastIndexOf('\n', startIndex);
  const removeStartIndex = lineStartIndex === -1 ? startIndex : lineStartIndex + 1;
  const removeEndIndex = contents.indexOf('\n', endIndex);
  return (
    contents.slice(0, removeStartIndex) + contents.slice(removeEndIndex === -1 ? contents.length : removeEndIndex + 1)
  );
}

function applyClerkAndroidMavenLocalRepository(contents, localPackage) {
  const withoutExistingBlock = removeClerkAndroidMavenLocalRepositoryBlock(contents);
  if (!localPackage) {
    return withoutExistingBlock;
  }

  const repositoryBlockPattern = /(allprojects\s*\{\s*repositories\s*\{)/;
  if (!repositoryBlockPattern.test(withoutExistingBlock)) {
    throw new Error('Could not find allprojects.repositories in Android build.gradle to add mavenLocal().');
  }

  return withoutExistingBlock.replace(repositoryBlockPattern, `$1\n${getClerkAndroidMavenLocalRepositoryBlock()}`);
}

function withLocalClerkAndroidSdk(config) {
  return withProjectBuildGradle(config, modConfig => {
    const localPackage = resolveClerkAndroidSdkPath(modConfig);
    modConfig.modResults.contents = applyClerkAndroidMavenLocalRepository(modConfig.modResults.contents, localPackage);

    if (localPackage) {
      console.log(`✅ Added mavenLocal() for local clerk-android artifacts (${localPackage.relativePath})`);
      const missingArtifacts = getMissingClerkAndroidMavenArtifacts(localPackage.absolutePath);
      if (missingArtifacts.length > 0) {
        console.warn(
          [
            '⚠️  Local clerk-android Maven artifacts were not found. Gradle will fall back to published artifacts unless you publish locally first.',
            `   From ${localPackage.absolutePath}, run:`,
            '   ./gradlew :source:api:publishToMavenLocal :source:telemetry:publishToMavenLocal :source:ui:publishToMavenLocal',
          ].join('\n'),
        );
      }
    }

    return modConfig;
  });
}

module.exports = {
  CLERK_ANDROID_LOCAL_SDK_PATH_ENV,
  CLERK_IOS_LOCAL_SDK_PATH_ENV,
  CLERK_IOS_VERSION,
  applyClerkAndroidMavenLocalRepository,
  configureClerkIosSdkPackage,
  findClerkIosPackageReferenceUuid,
  getConfiguredClerkAndroidSdkPath,
  getConfiguredClerkIosSdkPath,
  getMissingClerkAndroidMavenArtifacts,
  getRequiredClerkAndroidMavenArtifacts,
  resolveClerkAndroidSdkPath,
  resolveClerkIosSdkPath,
  toPosixPath,
  withLocalClerkAndroidSdk,
};
