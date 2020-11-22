import { Pool } from 'pg';

import {
    Metric,
    Measurement,
} from 'database/model';

import { UserError } from '../middleware/errors';

export default class MetricStore {
    constructor (
        private pool: Pool,
    ) {}

    public async createMetric(metric: Metric): Promise<void> {
        const { name, type } = metric;
        try {
            await this.pool.query(
                `
                INSERT INTO Metric (name, type)
                VALUES ($1, $2)
                `,
                [name, type],
            );
        } catch (e: any) {
            if (e instanceof Error) {
                if (e.message.indexOf('unique constraint')) {
                    e = UserError(e, 'Metric name taken, please choose a different one');
                }
            }
            throw(e);
        }
    }

    public async upsertMetric(metric: Metric): Promise<void> {
        const { name } = metric;
		await this.pool.query(
            `
            INSERT INTO Metric (name)
            VALUES ($1)
            ON CONFLICT DO NOTHING
            `,
            [name],
        );
    }

    public async createMeasurement(measurement: Measurement): Promise<void> {
        const { metric_name, value, user_id, created_time } = measurement;
		await this.pool.query(
            `
            INSERT INTO Measurement(
                metric_name,
                value,
                user_id,
                created_time
            ) VALUES ($1, $2, $3, $4)
            `,
            [metric_name, value.toString(), user_id, created_time || new Date()],
        );
    }

    public async getMetrics(): Promise<Metric[]> {
		return (await this.pool.query(
            `SELECT id, name, type FROM Metric`,
        )).rows;
    }
}
