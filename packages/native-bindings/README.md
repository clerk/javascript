# Native bindings

This private compiler resolves the real TypeScript contract graph with the TypeScript checker. It emits the public Swift and Kotlin API, fixed JavaScript dispatch, typed state schema, compatibility manifest, and reviewable public API snapshots. Authentication roots are `SignInFutureResource` and `SignUpFutureResource`; the native names are `SignIn` and `SignUp`.

Run from the repository root:

```sh
pnpm --filter @clerk/native-bindings generate
pnpm --filter @clerk/native-bindings check
pnpm --filter @clerk/native-bindings test
node packages/native-bindings/src/api-diff.mjs before/generated packages/native-bindings/generated
```

`src/policy.mjs` selects roots and records exceptions. Ordinary methods and properties are discovered automatically. Unsupported shapes, overloads, native name collisions, legacy authentication edges, noncanonical authentication error envelopes, and unused exception targets fail generation. Review every generated API change: a serializable signature does not establish native platform availability.

`generated/api-model.json` records source locations, documentation, deprecations, and a disposition for every reached member. `swift-api.txt` and `kotlin-api.txt` describe the emitted type and method signatures; the diff command exits with status 2 for removals or changed signatures. Release CI must review these diffs alongside actual native compilation and runtime tests. Generated files are committed and `check` verifies byte-for-byte regeneration.

Nullable and optional values remain distinct. Native `Field<T>` carries omitted, null, or value when all three states are legal. String enums retain unrecognized output values; input codecs reject values outside the declared contract. Unions carry a generated case tag and typed payload. Output selection prioritizes recognized shared string discriminators before unknown-enum fallback, so future enum values remain representable without dropping fields from known alternatives. Malformed known alternatives fail instead of being relabeled as another branch. Unknown ordinary values fail generation; only explicitly identified metadata and claims use JSON.

Approved authentication `{ error: ClerkError | null }` results become throwing Swift async methods and suspending Kotlin methods returning Unit. The bridge applies the complete state revision before native completion or error. It preserves the original envelope on the wire and distinguishes a returned Clerk error from a rejected operation, a bridge failure, and cancellation. `finalize()` takes no navigation callback and remains explicit.

The core revision, canonical roots, contract hash, protocol, and host capability version are recorded in the manifest. The mobile-runtime pack step pins the executable bundle hash. Neither native consumers nor their build systems need Node or npm.
