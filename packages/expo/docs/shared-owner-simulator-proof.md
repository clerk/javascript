# Expo shared-owner Simulator verification

On 2026-09-09, the current local Expo and iOS SDKs completed both directions of profile editing and native sign-out in an Expo SDK 57 development application running Hermes. The real SwiftUI UserProfileView used its generated resource methods; the existing JavaScript Clerk owner performed the requests and supplied the React hooks.

The native editor changed Test User to Native User in both views. Calling user.update from JavaScript then changed both to JavaScript User. Native sign-out settled at Loaded: true and Signed in: false, cleared the JavaScript user, and removed the native profile. The original Clerk owner object remained the same throughout. The last three JavaScript requests were /me PATCH, /me PATCH, and /client/sessions DELETE; Clerk transports those mutations as POST with the \_method query parameter.

The [JSON evidence](shared-owner-simulator-proof.json) records commits, installed package hashes, matching generated contracts, fixture hashes, observed results, and the eight requests in the final run. The screen recording is `expo-ios-reproducible-shared-owner.mov` in the task's `outputs/native-core-evidence` directory; its checksum is in that record. The complete fixture preparation and journey are maintained in the JavaScript repository at `packages/expo/proofs/shared-owner` and were themselves rerun successfully.

This closes the iOS Simulator bidirectional state and native sign-out journey for the recorded versions. It does not close live authentication, actual old-major upgrades, Android interaction, physical-device prompts, or release performance/memory gates. The service fixture is explicitly injected in the test application; it is not part of the shipped SDK.

## Issues found while reproducing

The initial fixture omitted client-session deletion and did not account for the POST method override. It also returned a client credential on environment responses, causing an artificial parallel credential rotation during startup. These fixture mistakes were corrected before the final successful recording; none required a production sign-out or credential-transport change.

Building the Expo package exposed a separate reproducibility defect: region comments in the generated attached transport depended on the invocation directory. The build now uses a fixed repository directory, and the reproducibility checker compares repository, mobile-runtime and Expo invocations. The previously failing generated-file check now passes without changing the generated runtime behavior.

Expected development-key and deprecated SafeAreaView warnings are visible in the recording. Package installation reported ignored optional build scripts for browser-tabs-lock, bufferutil, core-js and utf-8-validate; the verified app completed the journey without enabling them.
