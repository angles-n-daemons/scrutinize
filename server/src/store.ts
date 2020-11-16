import { Pool } from 'pg';

import {
    Experiment,
    Metric,
    Measurement,
    VariantDetails,
    Details,
    Performance,
    Treatment,
    DataPoint,
} from './model';

export interface Store {
    healthy: () => Promise<boolean>;
    getExperiments: () => Promise<Experiment[]>;
    createExperiment: (data: Experiment) => Promise<void>;
    createTreatment: (data: Treatment) => Promise<void>;
    createMeasurement: (data: Measurement) => Promise<void>;
    upsertMetric: (data: Metric) => Promise<void>;
    getMetrics: (experiment: string) => Promise<Metric[]>;
    getDetails: (experiment: string) => Promise<Details>;
    getPerformance: (experiment: string) => Promise<Performance>;
}

export class PGStore {
    constructor (
        private pool: Pool,
    ) {}

    public async healthy(): Promise<boolean> {
		const rows = (await this.pool.query(
            `SELECT COUNT(*) FROM Experiment`
        )).rows;
 
        return rows.length === 1;
    }

    public async getExperiments(): Promise<Experiment[]> {
		return (await this.pool.query(
            `SELECT id, name, percentage, created_time, last_active_time FROM Experiment`
        )).rows;
    }

    public async createExperiment(experiment: Experiment): Promise<void> {
        await this.pool.query(
            `
            INSERT INTO Experiment(name, percentage)
            VALUES ($1, $2)
            `,
            [experiment.name, experiment.percentage],
        );
    }

    public async createTreatment(t: Treatment): Promise<void> {
        const { user_id, variant, error, duration_ms, experiment_name } = t;
		await this.pool.query(
            `
            INSERT INTO Treatment(
                user_id,
                variant,
                error,
                duration_ms,
                experiment_id
            )
            VALUES ($1, $2, $3, $4, (SELECT id FROM Experiment WHERE name=$5))
            `,
            [user_id, variant, error, duration_ms, experiment_name],
        );
    }

    public async upsertMetric(metric: Metric): Promise<void> {
        const { name, experiment_name } = metric;
		await this.pool.query(
            `
            INSERT INTO Metric(
                name,
                experiment_id
            )
            VALUES ($1, (SELECT id FROM Experiment WHERE name=$2))
            ON CONFLICT DO NOTHING
            `,
            [name, experiment_name],
        );
    }

    public async createMeasurement(measurement: Measurement): Promise<void> {
        const { metric_name, value, user_id, experiment_name, created_time } = measurement;
		await this.pool.query(
            `
            INSERT INTO Measurement(
                experiment_id,
                treatment_id,
                metric_name,
                value,
                user_id,
                variant,
                created_time
            )
            SELECT e.id, t.id, $1, $2, $3, t.variant, COALESCE($4, CURRENT_TIMESTAMP)
              FROM Treatment t
              JOIN experiment e ON t.experiment_id = e.id
             WHERE t.user_id=$5
               AND e.name=$6
              ORDER BY t.user_id, t.created_time DESC
              LIMIT 1
            `,
            [metric_name, value.toString(), user_id, created_time, user_id, experiment_name],
        );
    }

    public async getMetrics(experiment: string): Promise<Metric[]> {
		return (await this.pool.query(
            `SELECT name FROM Metric WHERE experiment_id=(SELECT id FROM Experiment WHERE name=$1)`,
            [experiment],
        )).rows;
    }

    public async getDetails(experiment: string): Promise<Details> {
		const details: Details = (await this.pool.query(
            `SELECT id, name, percentage, created_time, last_active_time
              FROM Experiment
             WHERE name=$1`,
            [experiment],
        )).rows[0] as Details;
        details.variants = (await this.pool.query(
            `SELECT variant,
                    COUNT(*) as volume,
                    COUNT(DISTINCT user_id) AS unique_users,
                    AVG(duration_ms) as duration_ms,
                    1.0 * SUM(CASE WHEN LENGTH(error) > 0 THEN 1 ELSE 0 END) / COUNT(*) as pct_error
              FROM Treatment
             WHERE experiment_id=(SELECT id FROM Experiment WHERE name=$1)
             GROUP BY variant`,
            [experiment],
        )).rows as VariantDetails[];
        return details;
    }

    public async getPerformance(experiment: string): Promise<Performance> {
		const rows = (await this.pool.query(
            `
            SELECT metric_name, DATE(created_time), variant, COUNT(*), AVG(value), STDDEV(value)
              FROM Measurement
             WHERE experiment_id=(SELECT id FROM Experiment WHERE name=$1)
             GROUP BY 1, 2, 3
             ORDER BY 1, 2 ASC, 3 ASC
            `,
            [experiment],
        )).rows as DataPoint[];

        const performance: Performance = {};
        for (const row of rows) {
            const { metric_name, variant, count, avg, stddev } = row;
            // data transformation - node-postgres returns strings
            row.count = parseFloat(count as unknown as string);
            row.avg = parseFloat(avg as unknown as string);
            row.stddev = parseFloat(stddev as unknown as string);

            if (!performance[metric_name]) {
                performance[metric_name] = {
                    control: [],
                    experiment: [],
                };
            }
            if (!performance[metric_name][variant]) {
                performance[metric_name][variant] = []
            }
            performance[metric_name][variant].push(row);
        }
        return performance;
    }
}
