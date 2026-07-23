import { type ConfigPlugin, createRunOncePlugin, withAppBuildGradle } from '@expo/config-plugins';

import pkg from '../../package.json';

/**
 * Add packaging exclusions to Android app build.gradle to resolve
 * duplicate META-INF file conflicts from clerk-android dependencies.
 */
const withClerkAndroidPackaging: ConfigPlugin = config => {
  return withAppBuildGradle(config, modConfig => {
    let buildGradle = modConfig.modResults.contents;

    // --- META-INF exclusion ---
    if (!buildGradle.includes('META-INF/versions/9/OSGI-INF/MANIFEST.MF')) {
      // AGP 8+ uses `packaging` DSL, older versions use `packagingOptions`
      const packagingMatch = buildGradle.match(/packaging\s*\{/) || buildGradle.match(/packagingOptions\s*\{/);
      if (packagingMatch) {
        const blockName = packagingMatch[0].trim().replace(/\s*\{$/, '');
        const resourcesExclude = `${blockName} {
        // Clerk Android SDK: exclude duplicate META-INF files
        resources {
            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']
        }`;

        buildGradle = buildGradle.replace(new RegExp(`${blockName}\\s*\\{`), resourcesExclude);
      } else {
        // No packaging block found; append one at the end of the android block
        const androidBlockEnd = buildGradle.lastIndexOf('}');
        if (androidBlockEnd !== -1) {
          const packagingBlock = `\n    packaging {\n        resources {\n            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']\n        }\n    }\n`;
          buildGradle = buildGradle.slice(0, androidBlockEnd) + packagingBlock + buildGradle.slice(androidBlockEnd);
        }
      }
    }

    modConfig.modResults.contents = buildGradle;
    return modConfig;
  });
};

/**
 * Combined plugin that applies all Clerk configurations.
 *
 * When this plugin is used, it:
 * 1. Adds Android packaging exclusions to resolve dependency conflicts
 *
 * Native modules and views are registered via Expo Modules autolinking.
 */
const withClerkExpo: ConfigPlugin = config => {
  config = withClerkAndroidPackaging(config);
  return config;
};

export default createRunOncePlugin(withClerkExpo, pkg.name, pkg.version);
