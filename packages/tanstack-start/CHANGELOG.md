# @clerk/tanstack-start

## 0.3.5

### Patch Changes

- Types fix for `createClerkHandler` ([#4081](https://github.com/clerk/javascript/pull/4081)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0), [`1fe744328`](https://github.com/clerk/javascript/commit/1fe744328d126bc597e81770119796ac18e055ed)]:
  - @clerk/clerk-react@5.7.0
  - @clerk/types@4.19.0
  - @clerk/backend@1.9.2
  - @clerk/shared@2.6.2

## 0.3.4

### Patch Changes

- Fix to prevent hard reload for internal navigation ([#4078](https://github.com/clerk/javascript/pull/4078)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733), [`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/clerk-react@5.6.0
  - @clerk/types@4.18.0
  - @clerk/backend@1.9.1
  - @clerk/shared@2.6.1

## 0.3.3

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`c9ef59106`](https://github.com/clerk/javascript/commit/c9ef59106c4720af3012586f5656f7b54cf2e336), [`fece72014`](https://github.com/clerk/javascript/commit/fece72014e2d39c8343a7329ae677badcba56d15), [`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`9d0477781`](https://github.com/clerk/javascript/commit/9d04777814bf6d86d05506838b101e7cfc7c208d), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/backend@1.9.0
  - @clerk/clerk-react@5.5.0
  - @clerk/types@4.17.0
  - @clerk/shared@2.6.0

## 0.3.2

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0
  - @clerk/backend@1.8.3
  - @clerk/clerk-react@5.4.5
  - @clerk/shared@2.5.5

## 0.3.1

### Patch Changes

- Fix a bug when using the `getAuth` function multiple times ([#4019](https://github.com/clerk/javascript/pull/4019)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1
  - @clerk/backend@1.8.2
  - @clerk/clerk-react@5.4.4
  - @clerk/shared@2.5.4

## 0.3.0

### Minor Changes

- Add support for path based routing and TanStack Router only apps ([#3932](https://github.com/clerk/javascript/pull/3932)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`96234ce3d`](https://github.com/clerk/javascript/commit/96234ce3d44ec6f262c07cc7416171f4cb82e07b), [`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/clerk-react@5.4.3
  - @clerk/types@4.15.0
  - @clerk/backend@1.8.1
  - @clerk/shared@2.5.3

## 0.2.3

### Patch Changes

- Updated dependencies [[`ed7baa048`](https://github.com/clerk/javascript/commit/ed7baa0488df0ee4c48add2aac934ffb47e4a6d2)]:
  - @clerk/backend@1.8.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c), [`dc94c0834`](https://github.com/clerk/javascript/commit/dc94c08341c883fa5bf891f880fb34c4569ea820)]:
  - @clerk/types@4.14.0
  - @clerk/backend@1.7.0
  - @clerk/clerk-react@5.4.2
  - @clerk/shared@2.5.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/shared@2.5.1
  - @clerk/clerk-react@5.4.1
  - @clerk/types@4.13.1
  - @clerk/backend@1.6.3

## 0.2.0

### Minor Changes

- Introduce `getAuth` that can be used in server functions. ([#3900](https://github.com/clerk/javascript/pull/3900)) by [@octoper](https://github.com/octoper)

  Example usage:

  ```tsx
  import { getAuth } from '@clerk/tanstack-start/server'
  import { createServerFn } from '@tanstack/start'


  export const fetchCurrentUserPosts = createServerFn('GET', async (_payload, ctx) => {
    const { userId } = await getAuth(ctx)

    if (!userId) {
      ...
    }

    ...
  })
  ```

- Throw a more useful error when `clerkHandler()` is not configured in the SSR entrypoint ([#3918](https://github.com/clerk/javascript/pull/3918)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/clerk-react@5.4.0
  - @clerk/types@4.13.0
  - @clerk/backend@1.6.2

## 0.1.16

### Patch Changes

- Updated dependencies [[`d7bf0f87c`](https://github.com/clerk/javascript/commit/d7bf0f87c4c50bc19d2796bca32bd694046a23b0), [`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/backend@1.6.1
  - @clerk/types@4.12.1
  - @clerk/clerk-react@5.3.3
  - @clerk/shared@2.4.5

## 0.1.15

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/backend@1.6.0
  - @clerk/types@4.12.0
  - @clerk/clerk-react@5.3.2
  - @clerk/shared@2.4.4

## 0.1.14

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0
  - @clerk/backend@1.5.2
  - @clerk/clerk-react@5.3.1
  - @clerk/shared@2.4.3

## 0.1.13

### Patch Changes

- Updated dependencies [[`992e5960c`](https://github.com/clerk/javascript/commit/992e5960c785eace83f3bad7c34d589fa313dcaf)]:
  - @clerk/backend@1.5.1

## 0.1.12

### Patch Changes

- Updated dependencies [[`fde5b5e7e`](https://github.com/clerk/javascript/commit/fde5b5e7e6fb5faa4267e06d82a38a176165b4f4), [`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/backend@1.5.0
  - @clerk/clerk-react@5.3.0
  - @clerk/types@4.10.0
  - @clerk/shared@2.4.2

## 0.1.11

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1
  - @clerk/backend@1.4.3
  - @clerk/clerk-react@5.2.10
  - @clerk/shared@2.4.1

## 0.1.10

### Patch Changes

- Updated dependencies [[`d465d7069`](https://github.com/clerk/javascript/commit/d465d70696bf26270cb2efbf4695ca49016fcb96)]:
  - @clerk/backend@1.4.2

## 0.1.9

### Patch Changes

- Updated dependencies [[`045fb93cb`](https://github.com/clerk/javascript/commit/045fb93cbf577ca84e5b95fc6dfaacde67693be2)]:
  - @clerk/backend@1.4.1

## 0.1.8

### Patch Changes

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/backend@1.4.0
  - @clerk/shared@2.4.0
  - @clerk/types@4.9.0
  - @clerk/clerk-react@5.2.9

## 0.1.7

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0
  - @clerk/backend@1.3.2
  - @clerk/clerk-react@5.2.8
  - @clerk/shared@2.3.3

## 0.1.6

### Patch Changes

- Updated dependencies [[`5642b2616`](https://github.com/clerk/javascript/commit/5642b26167a6eb1aca68777d782a9686edacfd37)]:
  - @clerk/backend@1.3.1

## 0.1.5

### Patch Changes

- Updated dependencies [[`427fcdeaa`](https://github.com/clerk/javascript/commit/427fcdeaaba4e77273be29b4d7cca43f9aa18693)]:
  - @clerk/clerk-react@5.2.7

## 0.1.4

### Patch Changes

- Updated dependencies [[`f1847b70b`](https://github.com/clerk/javascript/commit/f1847b70b2327bd490faf1f3eed1aa5639d54993)]:
  - @clerk/backend@1.3.0

## 0.1.3

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/backend@1.2.5
  - @clerk/clerk-react@5.2.6
  - @clerk/shared@2.3.2

## 0.1.2

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1
  - @clerk/backend@1.2.4
  - @clerk/clerk-react@5.2.5
  - @clerk/shared@2.3.1

## 0.1.1

### Patch Changes

- Introducing experimental version of Clerk SDK for TanStack Start ([#3538](https://github.com/clerk/javascript/pull/3538)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/shared@2.3.0
  - @clerk/backend@1.2.3
  - @clerk/clerk-react@5.2.4
