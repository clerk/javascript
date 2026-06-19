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
    'description' => 'Clerk Expo native bridge',
    'license' => 'MIT',
    'author' => 'Clerk',
    'homepage' => 'https://clerk.com/'
  }
end

Pod::Spec.new do |s|
  s.name           = 'ClerkExpoBridge'
  s.version        = package['version']
  s.summary        = 'Shared native bridge API for Clerk Expo'
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  # NOTE: Must match CLERK_MIN_IOS_VERSION in app.plugin.js
  s.platforms      = { :ios => '17.0' }
  s.swift_version  = '5.10'
  s.source         = { git: 'https://github.com/clerk/javascript' }
  s.static_framework = true

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = 'ClerkExpoBridge.swift'
end
