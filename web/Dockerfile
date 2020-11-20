# ---------- Base ----------
FROM node:15-alpine AS base

WORKDIR /app

# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS build

COPY package*.json ./

RUN npm install

COPY ./tsconfig.json ./

COPY ./public ./public

COPY ./src ./src

RUN ls

RUN npm run build

RUN npm prune --production # Remove dev dependencies

# ---------- Release ----------
# Stage 2
FROM nginx:1.17.1-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
