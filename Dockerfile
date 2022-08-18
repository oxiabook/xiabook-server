FROM node:14-alpine AS builder
WORKDIR "/opt/xiabook-server"
COPY . .
RUN npm ci
RUN npm run build
RUN npm prune --production
FROM node:14-alpine AS production
WORKDIR "/opt/xiabook-server"
COPY --from=builder /opt/xiabook-server/package.json ./package.json
COPY --from=builder /opt/xiabook-server/package-lock.json ./package-lock.json
COPY --from=builder /opt/xiabook-server/dist ./dist
COPY --from=builder /opt/xiabook-server/node_modules ./node_modules
CMD [ "sh", "-c", "npm run start:prod"]