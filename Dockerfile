FROM node:22-slim
WORKDIR /app

RUN npm install -g pnpm@9

# Copy manifests + prisma schema before source (layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY api/package.json ./api/
COPY db/package.json ./db/
COPY db/prisma/ ./db/prisma/
COPY schemas/package.json ./schemas/
COPY app/package.json ./app/

RUN pnpm install --frozen-lockfile

# Copy source
COPY api/ ./api/
COPY db/ ./db/
COPY schemas/ ./schemas/
COPY scripts/ ./scripts/

# Build schemas (API depends on dist/)
RUN pnpm --filter @iveco-academy/schemas build

# Regenerate Prisma client after full source copy
RUN pnpm --filter db exec prisma generate

RUN chmod +x scripts/start.sh

EXPOSE 3000
CMD ["scripts/start.sh"]
