FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/sdk/package.json packages/sdk/package.json
COPY packages/mcp/package.json packages/mcp/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/sdk/node_modules ./packages/sdk/node_modules
COPY --from=deps /app/packages/mcp/node_modules ./packages/mcp/node_modules
COPY packages/sdk packages/sdk
COPY packages/mcp packages/mcp
COPY package.json pnpm-workspace.yaml tsconfig.json ./
RUN pnpm --filter @opensplit/sdk build && pnpm --filter @opensplit/mcp build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/packages/mcp/dist ./dist
COPY --from=build /app/packages/mcp/node_modules ./node_modules
COPY --from=build /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=build /app/packages/mcp/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/index.js", "--http"]
