FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy configuration files
COPY tsconfig.json ./

# Copy source files
COPY src/ ./src/

# Build TypeScript and verify
RUN echo "Current directory:" && pwd && \
    echo "Contents of current directory:" && ls -la && \
    echo "Contents of src directory:" && ls -la src/ && \
    echo "Building TypeScript..." && \
    npm run build && \
    echo "Contents after build:" && ls -la && \
    echo "Contents of dist directory:" && ls -la dist/ && \
    [ -f dist/index.js ] || (echo "Build failed: index.js not found" && exit 1)

EXPOSE 4000

CMD ["npm", "start"] 