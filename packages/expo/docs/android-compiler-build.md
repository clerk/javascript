# Expo Android compiler compatibility

Expo SDK 57 / React Native 0.86's AGP 8.12.0 used R8 8.12.14 in this build. With the native SDK compiled by Kotlin 2.4.10, the debug build emitted 6,364 D8 Kotlin-metadata rewrite errors, including generated Clerk classes. The build returned success, so exit status alone did not establish compiler compatibility.

The [Android Kotlin compatibility table](https://developer.android.com/build/kotlin-support) requires R8 9.1.29 or newer for Kotlin 2.4. The plugin now configures the published, tested 9.1.43 version using the [R8 project's settings.gradle override procedure](https://r8.googlesource.com/r8/+/refs/heads/main/README.md#replacing-r8-in-android-gradle-plugin). Kotlin source compilation remains separate: a dependency's metadata version is fixed by the compiler that produced that dependency.

## Configuration

The Clerk config plugin adds a marked buildscript block inside settings.gradle's pluginManagement block. Repeated prebuild replaces only that marked block. It uses Google Maven and Maven Central and adds com.android.tools:r8:9.1.43 to the settings plugin classpath.

To select a compatible compiler for a custom toolchain:

```json
{
  "plugins": [["@clerk/expo", { "androidR8Version": "9.4.17" }]]
}
```

This example illustrates the option; the recorded app build used 9.1.43. Set androidR8Version to false to remove only Clerk's generated override and use the app's compiler. Do that only when the app's AGP/R8 supports its compiled dependencies. The plugin does not suppress metadata errors. Preserve an app's intentionally selected newer compiler when adopting this prerelease; do not assume the pinned default is the right version for every future toolchain.

## Verification

The actual plugin-generated settings selected R8 9.1.43. Debug and minified release builds both passed with zero Kotlin-metadata rewrite errors; the release contains a Hermes bytecode bundle. Both APKs contain the expected native bundle and generated contract. All 35 config-plugin tests passed, including repeated generation and changing/disabling the override. The [JSON record](android-compiler-build.json) pins artifact hashes, SDK revisions, compiler versions and the exact scope.

The full Android SDK API/UI local publication requires JDK 21, as used by repository CI. Running that task with JDK 17 failed during Paparazzi plugin resolution. No published remote package was modified; all SDK publication in this proof targeted the task's local Maven directory.

AGP's asynchronous class-file parsing warning, Gradle metaspace pressure, SDK XML and upstream deprecation warnings remain recorded. They did not fail the builds. The metaspace message concerns the Gradle build process, not app runtime memory.

The Android interactive shared-owner journey remains unverified because desktop access was locked. Builds, hashes and code inspection do not substitute for that journey. This evidence also does not prove physical-device authentication, an actual old-major upgrade or release runtime performance.
