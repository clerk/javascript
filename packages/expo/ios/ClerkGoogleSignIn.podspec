require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ClerkGoogleSignIn'
  s.version        = package['version']
  s.summary        = 'Native Google Sign-In module for Clerk Expo'
  s.description    = 'Native Google Sign-In functionality using Google Sign-In SDK with nonce support for Clerk authentication'
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = { :ios => '13.4' }
  s.swift_version  = '5.4'
  s.source         = { :git => 'https://github.com/clerk/javascript.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'GoogleSignIn', '~> 9.0'

  # Only include the Google Sign-In module file, not ClerkSignInView.swift which uses `import Clerk` (SPM)
  s.source_files = 'ClerkGoogleSignInModule.swift'
end
