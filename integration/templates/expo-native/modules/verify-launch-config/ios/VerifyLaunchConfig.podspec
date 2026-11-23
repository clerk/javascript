Pod::Spec.new do |s|
  s.name           = 'VerifyLaunchConfig'
  s.version        = '1.0.0'
  s.summary        = 'Reads verify launch inputs for the Expo native fixture'
  s.author         = ''
  s.homepage       = 'https://github.com/clerk/javascript'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.swift"
end
