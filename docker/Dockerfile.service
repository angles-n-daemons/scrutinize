# ---------- Base ----------
FROM node:15-alpine AS base

WORKDIR /app

# ---------- build-web ----------
# Creates:
# - dist: A production build compiled with Babel
FROM base AS build-web

COPY ./web/package*.json ./

RUN npm install

COPY ./web/tsconfig.json ./

COPY ./web/public ./public

COPY ./web/src ./src

RUN npm run build

RUN npm prune --production # Remove dev dependencies

# ---------- build-server ----------
# Creates:
# - build: A production build compiled with Babel
FROM base AS build-server

ENV NODE_ENV=development

COPY ./server/package*.json ./

COPY ./server/tsconfig.json ./

COPY ./server/src ./src

RUN npm install typescript -g

RUN npm install

ENV PATH /app/node_modules/.bin:$PATH

RUN npm run build

RUN npm prune --production # Remove dev dependencies

# ---------- Release ----------
# Stage 2
FROM base

RUN apk add bash nginx vim
RUN mkdir /run/nginx

COPY --from=build-web /app/build /usr/share/nginx/html
COPY --from=build-server /app/build ./build
COPY --from=build-server /app/node_modules ./node_modules

COPY ./docker/run.sh ./
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["./run.sh"]
