#!/usr/bin/env bash
HOST=${SCRUTINIZE_DB_HOST:-0.0.0.0}
PORT=${SCRUTINIZE_DB_PORT:-5432}
DB=${SCRUTINIZE_DB_NAME:-scrutinize}
USER=${SCRUTINIZE_DB_USER:-postgres}

while ! nc -z ${HOST} ${PORT}; do
  echo 'Postgres is unavailable.'
  sleep 1
done

# create database if it doesn't exist
psql -h ${HOST} -p ${PORT} -U ${USER} -tc "SELECT 1 FROM pg_database WHERE datname = '${DB}'" | grep -q 1 || createdb -O ${USER} ${DB}
