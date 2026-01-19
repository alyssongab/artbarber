# ===================================
# Stage 1: Builder
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set dummy DATABASE_URL for Prisma generation (required during build)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript (if needed, but your project uses ts-node-esm)
# RUN npm run build

# ===================================
# Stage 2: Production
# ===================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies (all, because we need dev dependencies like ts-node)
RUN yarn install --frozen-lockfile

# Set dummy DATABASE_URL for Prisma generation
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma Client in production stage
RUN npx prisma generate

# Copy source code from builder
COPY --from=builder /app/src ./src

# Copy prisma for migrations
COPY prisma ./prisma

# Expose port
EXPOSE 3030

# Start server (migrations will be run by docker-compose command)
CMD ["yarn", "dev"]
