FROM node:24-bookworm-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY . ./
CMD ["npm", "start"]
