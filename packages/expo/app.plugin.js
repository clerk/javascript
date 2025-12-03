/**
 * Expo config plugin for @clerk/clerk-expo
 * Automatically configures iOS to work with Clerk native components
 */
const { withXcodeProject, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const CLERK_IOS_REPO = 'https://github.com/clerk/clerk-ios.git';
const CLERK_IOS_VERSION = '0.68.1';

const CLERK_MIN_IOS_VERSION = '17.0';

const withClerkIOS = config => {
  console.log('✅ Clerk iOS plugin loaded');

  // IMPORTANT: Set iOS deployment target in Podfile.properties.json BEFORE pod install
  // This ensures ClerkExpo pod gets installed (it requires iOS 17.0)
  config = withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePropertiesPath = path.join(config.modRequest.platformProjectRoot, 'Podfile.properties.json');

      let properties = {};
      if (fs.existsSync(podfilePropertiesPath)) {
        try {
          properties = JSON.parse(fs.readFileSync(podfilePropertiesPath, 'utf8'));
        } catch {
          // If file exists but is invalid JSON, start fresh
        }
      }

      // Set the iOS deployment target
      if (
        !properties['ios.deploymentTarget'] ||
        parseFloat(properties['ios.deploymentTarget']) < parseFloat(CLERK_MIN_IOS_VERSION)
      ) {
        properties['ios.deploymentTarget'] = CLERK_MIN_IOS_VERSION;
        fs.writeFileSync(podfilePropertiesPath, JSON.stringify(properties, null, 2) + '\n');
        console.log(`✅ Set ios.deploymentTarget to ${CLERK_MIN_IOS_VERSION} in Podfile.properties.json`);
      }

      return config;
    },
  ]);

  // First update the iOS deployment target to 17.0 (required by Clerk iOS SDK)
  config = withXcodeProject(config, config => {
    const xcodeProject = config.modResults;

    try {
      // Update deployment target in all build configurations
      const buildConfigs = xcodeProject.hash.project.objects.XCBuildConfiguration || {};

      for (const [uuid, buildConfig] of Object.entries(buildConfigs)) {
        if (buildConfig && buildConfig.buildSettings) {
          const currentTarget = buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET;
          if (currentTarget && parseFloat(currentTarget) < parseFloat(CLERK_MIN_IOS_VERSION)) {
            buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = CLERK_MIN_IOS_VERSION;
          }
        }
      }

      console.log(`✅ Updated iOS deployment target to ${CLERK_MIN_IOS_VERSION}`);
    } catch (error) {
      console.error('❌ Error updating deployment target:', error.message);
    }

    return config;
  });

  // Then add the Swift Package dependency
  config = withXcodeProject(config, config => {
    const xcodeProject = config.modResults;

    try {
      // Get the main app target
      const targets = xcodeProject.getFirstTarget();
      if (!targets) {
        console.warn('⚠️  Could not find main target in Xcode project');
        return config;
      }

      const targetUuid = targets.uuid;
      const targetName = targets.name;

      // Add Swift Package reference to the project
      const packageUuid = xcodeProject.generateUuid();
      const packageName = 'clerk-ios';

      // Add package reference to XCRemoteSwiftPackageReference section
      if (!xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference) {
        xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference = {};
      }

      xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference[packageUuid] = {
        isa: 'XCRemoteSwiftPackageReference',
        repositoryURL: CLERK_IOS_REPO,
        requirement: {
          kind: 'upToNextMajorVersion',
          minimumVersion: CLERK_IOS_VERSION,
        },
      };

      // Add package product dependency
      const productUuid = xcodeProject.generateUuid();
      if (!xcodeProject.hash.project.objects.XCSwiftPackageProductDependency) {
        xcodeProject.hash.project.objects.XCSwiftPackageProductDependency = {};
      }

      xcodeProject.hash.project.objects.XCSwiftPackageProductDependency[productUuid] = {
        isa: 'XCSwiftPackageProductDependency',
        package: packageUuid,
        productName: 'Clerk',
      };

      // Add package to project's package references
      const projectSection = xcodeProject.hash.project.objects.PBXProject;
      const projectUuid = Object.keys(projectSection)[0];
      const project = projectSection[projectUuid];

      if (!project.packageReferences) {
        project.packageReferences = [];
      }

      // Check if package is already added
      const alreadyAdded = project.packageReferences.some(ref => {
        const refObj = xcodeProject.hash.project.objects.XCRemoteSwiftPackageReference[ref.value];
        return refObj && refObj.repositoryURL === CLERK_IOS_REPO;
      });

      if (!alreadyAdded) {
        project.packageReferences.push({
          value: packageUuid,
          comment: packageName,
        });
      }

      // Add package product to main app target
      const nativeTarget = xcodeProject.hash.project.objects.PBXNativeTarget[targetUuid];
      if (!nativeTarget.packageProductDependencies) {
        nativeTarget.packageProductDependencies = [];
      }

      const productAlreadyAdded = nativeTarget.packageProductDependencies.some(dep => dep.value === productUuid);

      if (!productAlreadyAdded) {
        nativeTarget.packageProductDependencies.push({
          value: productUuid,
          comment: 'Clerk',
        });
      }

      // Also add package to ClerkExpo pod target if it exists
      const allTargets = xcodeProject.hash.project.objects.PBXNativeTarget;
      for (const [uuid, target] of Object.entries(allTargets)) {
        if (target && target.name === 'ClerkExpo') {
          if (!target.packageProductDependencies) {
            target.packageProductDependencies = [];
          }

          const podProductAlreadyAdded = target.packageProductDependencies.some(dep => dep.value === productUuid);

          if (!podProductAlreadyAdded) {
            target.packageProductDependencies.push({
              value: productUuid,
              comment: 'Clerk',
            });
            console.log(`✅ Added Clerk package to ClerkExpo pod target`);
          }
        }
      }

      console.log(`✅ Added clerk-ios Swift package dependency (${CLERK_IOS_VERSION})`);
    } catch (error) {
      console.error('❌ Error adding clerk-ios package:', error.message);
    }

    return config;
  });

  // Inject ClerkViewFactory.register() call into AppDelegate.swift
  config = withDangerousMod(config, [
    'ios',
    async config => {
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const projectName = config.modRequest.projectName;
      const appDelegatePath = path.join(platformProjectRoot, projectName, 'AppDelegate.swift');

      if (fs.existsSync(appDelegatePath)) {
        let contents = fs.readFileSync(appDelegatePath, 'utf8');

        // Check if already added
        if (!contents.includes('ClerkViewFactory.register()')) {
          // Find the didFinishLaunchingWithOptions method and add the registration call
          // Look for the return statement in didFinishLaunching
          const pattern = /(func application\s*\([^)]*didFinishLaunchingWithOptions[^)]*\)[^{]*\{)/;
          const match = contents.match(pattern);

          if (match) {
            // Insert after the opening brace of didFinishLaunching
            const insertPoint = match.index + match[0].length;
            const registrationCode = '\n    // Register Clerk native views\n    ClerkViewFactory.register()\n';
            contents = contents.slice(0, insertPoint) + registrationCode + contents.slice(insertPoint);
            fs.writeFileSync(appDelegatePath, contents);
            console.log('✅ Added ClerkViewFactory.register() to AppDelegate.swift');
          } else {
            console.warn('⚠️  Could not find didFinishLaunchingWithOptions in AppDelegate.swift');
          }
        }
      }

      return config;
    },
  ]);

  // Then inject ClerkSignInView.swift into the app target
  // This is required because the file uses `import Clerk` which is only available
  // via SPM in the app target (CocoaPods targets can't see SPM packages)
  config = withXcodeProject(config, config => {
    try {
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const projectName = config.modRequest.projectName;
      const iosProjectPath = path.join(platformProjectRoot, projectName);

      // Find the ClerkSignInView.swift source file from node_modules
      // Handle both pnpm workspace and regular node_modules
      let sourceFile;
      const workspacePath = path.join(
        config.modRequest.projectRoot,
        '..',
        'javascript',
        'packages',
        'expo',
        'ios',
        'ClerkSignInView.swift',
      );
      const nodeModulesPath = path.join(
        config.modRequest.projectRoot,
        'node_modules',
        '@clerk',
        'clerk-expo',
        'ios',
        'ClerkSignInView.swift',
      );

      if (fs.existsSync(workspacePath)) {
        sourceFile = workspacePath;
      } else if (fs.existsSync(nodeModulesPath)) {
        sourceFile = nodeModulesPath;
      }

      if (sourceFile && fs.existsSync(sourceFile)) {
        // Copy it to the app target directory
        const targetFile = path.join(iosProjectPath, 'ClerkSignInView.swift');
        fs.copyFileSync(sourceFile, targetFile);
        console.log('✅ Copied ClerkSignInView.swift to app target');

        // Add the file to the Xcode project manually
        const xcodeProject = config.modResults;
        const relativePath = `${projectName}/ClerkSignInView.swift`;
        const fileName = 'ClerkSignInView.swift';

        try {
          // Get the main target
          const target = xcodeProject.getFirstTarget();
          if (!target || !target.uuid) {
            console.warn('⚠️  Could not find target UUID, file copied but not added to project');
            return config;
          }

          const targetUuid = target.uuid;

          // Check if file is already in the project
          const fileReferences = xcodeProject.hash.project.objects.PBXFileReference || {};
          const alreadyExists = Object.values(fileReferences).some(ref => ref && ref.path === fileName);

          if (alreadyExists) {
            console.log('✅ ClerkSignInView.swift already in Xcode project');
            return config;
          }

          // 1. Create PBXFileReference
          const fileRefUuid = xcodeProject.generateUuid();
          if (!xcodeProject.hash.project.objects.PBXFileReference) {
            xcodeProject.hash.project.objects.PBXFileReference = {};
          }

          xcodeProject.hash.project.objects.PBXFileReference[fileRefUuid] = {
            isa: 'PBXFileReference',
            lastKnownFileType: 'sourcecode.swift',
            name: fileName,
            path: relativePath, // Use full relative path (projectName/ClerkSignInView.swift)
            sourceTree: '"<group>"',
          };

          // 2. Create PBXBuildFile
          const buildFileUuid = xcodeProject.generateUuid();
          if (!xcodeProject.hash.project.objects.PBXBuildFile) {
            xcodeProject.hash.project.objects.PBXBuildFile = {};
          }

          xcodeProject.hash.project.objects.PBXBuildFile[buildFileUuid] = {
            isa: 'PBXBuildFile',
            fileRef: fileRefUuid,
            fileRef_comment: fileName,
          };

          // 3. Add to PBXSourcesBuildPhase
          const buildPhases = xcodeProject.hash.project.objects.PBXSourcesBuildPhase || {};
          let sourcesPhaseUuid = null;

          // Find the sources build phase for the main target
          const nativeTarget = xcodeProject.hash.project.objects.PBXNativeTarget[targetUuid];
          if (nativeTarget && nativeTarget.buildPhases) {
            for (const phase of nativeTarget.buildPhases) {
              if (buildPhases[phase.value] && buildPhases[phase.value].isa === 'PBXSourcesBuildPhase') {
                sourcesPhaseUuid = phase.value;
                break;
              }
            }
          }

          if (sourcesPhaseUuid && buildPhases[sourcesPhaseUuid]) {
            if (!buildPhases[sourcesPhaseUuid].files) {
              buildPhases[sourcesPhaseUuid].files = [];
            }

            buildPhases[sourcesPhaseUuid].files.push({
              value: buildFileUuid,
              comment: fileName,
            });
          } else {
            console.warn('⚠️  Could not find PBXSourcesBuildPhase for target');
          }

          // 4. Add to PBXGroup (main group for the project)
          const groups = xcodeProject.hash.project.objects.PBXGroup || {};
          let mainGroupUuid = null;

          // Find the group with the same name as the project
          for (const [uuid, group] of Object.entries(groups)) {
            if (group && group.name === projectName) {
              mainGroupUuid = uuid;
              break;
            }
          }

          if (mainGroupUuid && groups[mainGroupUuid]) {
            if (!groups[mainGroupUuid].children) {
              groups[mainGroupUuid].children = [];
            }

            // Add file reference to the group
            groups[mainGroupUuid].children.push({
              value: fileRefUuid,
              comment: fileName,
            });
          } else {
            console.warn('⚠️  Could not find main PBXGroup for project');
          }

          console.log('✅ Added ClerkSignInView.swift to Xcode project');
        } catch (addError) {
          console.error('❌ Error adding file to Xcode project:', addError.message);
          console.error(addError.stack);
        }
      } else {
        console.warn('⚠️  ClerkSignInView.swift not found, skipping injection');
      }
    } catch (error) {
      console.error('❌ Error injecting ClerkSignInView.swift:', error.message);
    }

    return config;
  });

  return config;
};

module.exports = withClerkIOS;
