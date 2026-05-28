# syntax=docker/dockerfile:1.7

ARG PLAYWRIGHT_VERSION

FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

ARG BUILD_NODE_OPTIONS=--max-old-space-size=4096
ARG TURBO_CONCURRENCY=1

ENV CYPRESS_INSTALL_BINARY=0 \
    FORCE_COLOR=1 \
    HUSKY=0 \
    HUSKY_SKIP_INSTALL=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PNPM_HOME=/pnpm \
    TURBO_UI=0 \
    E2E_BROWSER=chromium

ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /workspace

RUN corepack enable pnpm && npm install --global pkglab

COPY deps/ ./
RUN --mount=type=cache,id=clerk-javascript-pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

COPY build/ ./
RUN --mount=type=cache,id=clerk-javascript-turbo-cache,target=/workspace/.turbo/cache \
    NODE_OPTIONS="${BUILD_NODE_OPTIONS}" pnpm turbo build --only --concurrency="${TURBO_CONCURRENCY}"
RUN pkglab pub --force

COPY repo/ ./

ENTRYPOINT ["bash", "-lc", "script=\"$1\"; shift; if [ \"$#\" -eq 0 ]; then exec pnpm run \"$script\"; fi; exec pnpm run \"$script\" -- \"$@\"", "bash"]
CMD ["test:integration:base"]
