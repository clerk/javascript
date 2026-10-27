# syntax=docker/dockerfile:1
FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e

WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
COPY . .
RUN --mount=type=cache,id=clerk-mosaic-visual-pnpm,target=/pnpm/store \
    pnpm --filter @clerk/mosaic... --filter . install --frozen-lockfile --store-dir /pnpm/store
RUN pnpm turbo build --filter=@clerk/mosaic...

WORKDIR /repo/packages/mosaic
