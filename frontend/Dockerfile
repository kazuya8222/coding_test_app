FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy configuration files
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./

# Copy source files
COPY src/ ./src/

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"] 