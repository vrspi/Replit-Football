FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Set environment variable for Docker
ENV REACT_APP_DOCKER=true

COPY . .

RUN npm run build

# Production image
FROM node:20-slim AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Production environment
ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
