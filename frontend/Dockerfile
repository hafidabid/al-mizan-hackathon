#----------------------------------------------------------------#
# Stage 1: Builder Stage - Compiles the React application        #
#----------------------------------------------------------------#
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Use a non-root user for security
USER node

WORKDIR /home/node/app

# Copy only package files first to leverage Docker cache
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install all dependencies needed for the build.
# We use --frozen-lockfile to ensure the lock file is respected.
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY --chown=node:node . .

# Run the build command
ENV CI=true
RUN pnpm run build

#----------------------------------------------------------------#
# Stage 2: Production Stage - Serves the built static files      #
#----------------------------------------------------------------#
FROM nginx:1.27-alpine AS production

# Remove the default Nginx configuration and welcome page
RUN rm /etc/nginx/conf.d/default.conf /usr/share/nginx/html/index.html

# Copy our custom, production-ready Nginx configuration
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the 'builder' stage
COPY --from=builder /home/node/app/dist /usr/share/nginx/html

EXPOSE 80

# Starts Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

#----------------------------------------------------------------#
# Stage 3: Development Stage - For local development with HMR    #
#----------------------------------------------------------------#
FROM node:20-alpine AS development

# Install pnpm globally
RUN npm install -g pnpm

USER node

WORKDIR /home/node/app

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy source code (will be overwritten by volume mount in compose)
COPY --chown=node:node . .

EXPOSE 5173

# Start development server and bind it to all network interfaces
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]