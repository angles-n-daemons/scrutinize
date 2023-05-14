# Development

This document details what you would need to get scrutinize running locally so that you may make changes to it. It assumes that you're able to run the web app, the server and the database on your machine so that you can make changes accordingly.

If you aim to use a scrutinize client, you should be using it in another project simultaneously.

### Requirements

| Requirement   | Version       |
| ------------- | ------------- |
| node          | 15.0+         |
| postgresql    | 14.0+         |
| goose         | 2.7.0+

### Setup the database

Assuming you have postgresql installed, you need to create a database named `scrutinize` with the owner `postgres`.

By default the application assumes you have no password for the database - if you need this or any other settings changed, you can supply them via environment variables specified in the [server's configuration file](/server/src/config.ts).

You can then run the migration script to bring the schema up to date. This script uses the same env variable names as the server's config file.

```bash
./db/migrate_db.sh
```

### Running the scrutinize server

Once the database is setup, you should be able to run the server. Install the depdendencies

```bash
npm i
```

and run the server

```bash
npm start
```

### Running the scrutninize web app

Do the same for the web application. Install the dependencies

```bash
npm i
```

and run the server

```bash
npm start
```

Verify that the system is working by navigating to the web app in your browser.


```bash
open http://localhost:11206
```

### Seeding the database with mock data

TBD

### Creating database migrations

We use goose to create migrations. You can learn more about it [here](https://github.com/pressly/goose). Migrations should be sql only, and in the `db` directory.
