import express from 'express';
import { Client } from 'pg';

import Config from './config';
import Controller from './controller';
import Router from './router';
import { PGStore } from './store';
import logMiddleware from './middleware/logger';
import errorMiddleware from './middleware/errors';

const BASE_PATH = '/api/v1'

async function main() {
    // Setup service components
    const config = Config.readFromEnvironment(process.env);
    const db = new Client(config.dbOptions());
    const store = new PGStore(db);
    const controller = new Controller(store);
    const router = new Router(controller);

    // Setup application
    const app = express();
    app.use(express.json());
    app.use(logMiddleware);
    app.use(BASE_PATH, router.routes());
    app.use(errorMiddleware);

    // Begin serving requests
    await db.connect();
    await app.listen(config.port, () => {
        console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
    }).on('error', (err) => {
        db.end();
        throw(err);
    });
}

main();
