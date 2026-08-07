const { withAppBuildGradle } = require('expo/config-plugins');

// clerk-android is compiled against OkHttp 5 but React Native pins OkHttp 4,
// leaving a mixed classpath: clerk networking breaks on the 4.x core
// (NoClassDefFoundError: okhttp3.internal.UnreadableResponseBody), while RN's
// cookie jar breaks on the 5.x core (okhttp3.internal.Util). Force the 5.x
// core plus the urlconnection shim that still ships a JavaNetCookieJar class
// compatible with it, so both stacks run on one coherent OkHttp.
const GRADLE_BLOCK = `
configurations.all {
    resolutionStrategy {
        force 'com.squareup.okhttp3:okhttp:5.4.0'
        force 'com.squareup.okhttp3:logging-interceptor:5.4.0'
        force 'com.squareup.okhttp3:okhttp-urlconnection:5.0.0-alpha.16'
    }
}
`;

module.exports = function withClerkOkHttpAlignment(config) {
  return withAppBuildGradle(config, cfg => {
    if (!cfg.modResults.contents.includes('com.squareup.okhttp3:okhttp:5.4.0')) {
      cfg.modResults.contents += GRADLE_BLOCK;
    }
    return cfg;
  });
};
