FROM node:22-slim
WORKDIR /app

RUN npm install -g pnpm@9

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @iveco-academy/schemas build
RUN pnpm --filter db exec prisma generate
RUN chmod +x scripts/start.sh

EXPOSE 3000
CMD ["scripts/start.sh"]
