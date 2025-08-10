FROM node:18
WORKDIR /app

# Install deps with caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source
COPY . /app

# Default to dev server; can be overridden in compose
CMD ["npm", "run", "dev", "--", "--host"]
