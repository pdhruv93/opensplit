FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/api/package.json packages/api/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY . .
WORKDIR /app/packages/api
RUN npx prisma generate
RUN npx nest build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/packages/api/dist ./dist
COPY --from=build /app/packages/api/prisma ./prisma
COPY --from=build /app/packages/api/node_modules ./node_modules
COPY --from=build /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=build /app/packages/api/package.json ./package.json

RUN mkdir -p /data

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main"]
