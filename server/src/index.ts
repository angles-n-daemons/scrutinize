import express from 'express';
import { Pool } from 'pg';

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
    const pool = new Pool(config.dbOptions());
    const store = new PGStore(pool);
    const controller = new Controller(store);
    const router = new Router(controller);

    // Setup application
    const app = express();
    app.use(express.json());
    app.use(logMiddleware);
    app.use(BASE_PATH, router.routes());
    app.use(errorMiddleware);

    // Begin serving requests
    await pool.connect();
    await app.listen(config.port, () => {
        console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
    }).on('error', (err) => {
        pool.end();
        throw(err);
    });
}

main();
