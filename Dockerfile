# ---- build: installa tutto, minifica e offusca gli asset client ----
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run check

# ---- runtime: solo server + asset compilati (i sorgenti client NON sono inclusi) ----
FROM node:22-slim
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "server/index.js"]
