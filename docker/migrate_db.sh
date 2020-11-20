#!/usr/bin/env bash
HOST=${SCRUTINIZE_DB_HOST:-0.0.0.0}
PORT=${SCRUTINIZE_DB_PORT:-5432}
DB=${SCRUTINIZE_DB_NAME:-scrutinize}
USER=${SCRUTINIZE_DB_USER:-postgres}
PASSWORD=${SCRUTINIZE_DB_PASSWORD:-password}

while ! nc -z ${HOST} ${PORT}; do
  echo 'Postgres is unavailable.'
  sleep 1
done

goose -dir db postgres "host=${HOST} port=${PORT} user=${USER} dbname=${DB} password=${PASSWORD} sslmode=disable" up
