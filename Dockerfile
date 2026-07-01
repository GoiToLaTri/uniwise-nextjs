# ===================================
# Stage 1: Builder
# ===================================
FROM node:22-bookworm-slim AS builder

# Cài đặt pnpm qua npm (đơn giản hơn)
RUN npm install -g pnpm@latest

WORKDIR /app 

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Debug
RUN cat pnpm-workspace.yaml
# Cài dependencies
RUN --mount=type=cache,id=pnpm_nextjs_cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile


COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true
ENV CI=true

RUN pnpm run build

# ===================================
# Stage 2: Production Runner
# ===================================
FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nextjs && \
    mkdir .next && \
    chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

HEALTHCHECK --interval=1m --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => {if(r.status !== 200) process.exit(1)}).catch(() => process.exit(1))"

CMD ["node", "server.js"]