require 'json'

# Find package.json by following symlinks if necessary
package_json_path = File.join(__dir__, '..', 'package.json')
package_json_path = File.join(File.readlink(__dir__), '..', 'package.json') if File.symlink?(__dir__)

# Fallback to hardcoded values if package.json is not found
if File.exist?(package_json_path)
  package = JSON.parse(File.read(package_json_path))
else
  package = {
    'version' => '0.0.0-FALLBACK',
    'description' => 'Clerk React Native/Expo library',
    'license' => 'MIT',
    'author' => 'Clerk',
    'homepage' => 'https://clerk.com/'
  }
end

Pod::Spec.new do |s|
  s.name           = 'ClerkExpo'
  s.version        = package['version']
  s.summary        = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  # NOTE: Must match CLERK_MIN_IOS_VERSION in app.plugin.js
  s.platforms      = { :ios => '17.0' }  # Clerk iOS SDK requires iOS 17
  s.swift_version  = '5.10'
  s.source         = { git: 'https://github.com/clerk/javascript' }
  s.static_framework = true

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  # Only include the module files in the pod (both Swift and ObjC bridges).
  # ClerkViewFactory.swift (with views) is injected into the app target by the config plugin
  # because it uses `import ClerkKit` which is only available via SPM in the app target.
  s.source_files = "ClerkExpoModule.swift", "ClerkExpoModule.m",
                   "ClerkAuthViewManager.swift", "ClerkAuthViewManager.m",
                   "ClerkUserProfileViewManager.swift", "ClerkUserProfileViewManager.m"

  install_modules_dependencies(s)
end
