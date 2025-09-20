# Etapa de compilación
FROM --platform=$BUILDPLATFORM node:22-slim AS builder

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Etapa de runtime (producción)
FROM --platform=$TARGETPLATFORM node:22-slim

WORKDIR /app

# 👇 Instalar certificados para conexiones SSL/TLS (Neon los necesita)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copiar solo lo necesario desde la etapa builder
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate \
  && pnpm install --prod --frozen-lockfile

# 👇 Forzar IPv4 para evitar EAI_AGAIN
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

CMD ["node", "dist/main.js"]
