FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src ./src
COPY openapi.json ./openapi.json
RUN mkdir /app/state && chown node:node /app/state
USER node
ENV HOST=0.0.0.0 PORT=3189 STATE_PATH=/app/state/iq.sqlite
EXPOSE 3189
CMD ["node", "src/server.mjs"]
