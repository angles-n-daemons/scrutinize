import express from 'express';
import { Pool } from 'pg';

import Config from './config';
import ExperimentController from './controller/experiment';
import ExperimentRouter from './routes/experiment';
import ExperimentStore from './database/experiment';
import MetricController from './controller/experiment';
import MetricRouter from './routes/experiment';
import MetricStore from './database/experiment';
import ReportingController from './controller/experiment';
import ReportingRouter from './routes/experiment';
import ReportingStore from './database/experiment';
import HealthRouter from './routes/health';
import logMiddleware from './middleware/logger';
import errorMiddleware from './middleware/errors';

const BASE_PATH = '/api/v1'

async function main() {
    // Setup service components
    const config = Config.readFromEnvironment(process.env);
    const pool = new Pool(config.dbOptions());
    const healthRouter = new HealthRouter(pool);
    const experimentRouter = new ExperimentRouter(
        new ExperimentController(
            new ExperimentStore(pool),
        ),
    );
    const metricRouter = new MetricRouter(
        new MetricController(
            new MetricStore(pool),
        ),
    );
    const reportingRouter = new ReportingRouter(
        new ReportingController(
            new ReportingStore(pool),
        ),
    );

    // Setup application
    const app = express();
    app.use(express.json());
    app.use(logMiddleware);
    app.use(BASE_PATH, healthRouter.routes());
    app.use(BASE_PATH, experimentRouter.routes());
    app.use(BASE_PATH, metricRouter.routes());
    app.use(BASE_PATH, reportingRouter.routes());
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
