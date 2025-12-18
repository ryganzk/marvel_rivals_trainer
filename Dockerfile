# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx && mkdir -p /run/nginx

# Copy package manifests and install prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm install typescript

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /app/app ./app
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/eslint.config.mjs ./eslint.config.mjs

# nginx config and entrypoint
    COPY nginx/nginx.conf /etc/nginx/nginx.conf
    COPY entrypoint.sh /entrypoint.sh
    RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 80

CMD ["/entrypoint.sh"]
