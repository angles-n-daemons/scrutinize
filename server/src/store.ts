import { Pool } from 'pg';

import {
    Experiment,
    Metric,
    Observation,
    Performance,
    Treatment,
    DataPoint,
} from './model';

export interface Store {
    healthy: () => Promise<boolean>;
    getExperiments: () => Promise<Experiment[]>;
    createExperiment: (data: Experiment) => Promise<void>;
    createTreatment: (data: Treatment) => Promise<void>;
    createObservation: (data: Observation) => Promise<void>;
    upsertMetric: (data: Metric) => Promise<void>;
    getMetrics: (experiment: string) => Promise<Metric[]>;
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
        const { user_id, treatment, error, experiment_name } = t;
		await this.pool.query(
            `
            INSERT INTO Treatment(
                user_id,
                treatment,
                error,
                experiment_id
            )
            VALUES ($1, $2, $3, (SELECT id FROM Experiment WHERE name=$4))
            `,
            [user_id, treatment, error, experiment_name],
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

    public async createObservation(observation: Observation): Promise<void> {
        const { metric_name, value, user_id, experiment_name } = observation;
        await this.pool.query('BEGIN');
		await this.pool.query(
            `
            INSERT INTO Observation(
                experiment_id,
                treatment_id,
                metric_name,
                value,
                user_id,
                treatment
            )
            SELECT e.id, t.id, $1, $2, $3, t.treatment
              FROM Treatment t
              JOIN experiment e ON t.experiment_id = e.id
             WHERE t.user_id=$4
               AND e.name=$5
              LIMIT 1
            `,
            [metric_name, value.toString(), user_id, user_id, experiment_name],
        );
    }

    public async getMetrics(experiment: string): Promise<Metric[]> {
		return (await this.pool.query(
            `SELECT name FROM Metric WHERE experiment_id=(SELECT id FROM Experiment WHERE name=$1)`,
            [experiment],
        )).rows;
    }

    public async getPerformance(experiment: string): Promise<Performance> {
		const rows = (await this.pool.query(
            `
            SELECT metric_name, DATE(created_time), treatment, COUNT(*), AVG(value), STDDEV(value)
              FROM Observation
             WHERE experiment_id=(SELECT id FROM Experiment WHERE name=$1)
             GROUP BY 1, 2, 3
             ORDER BY 1, 2 ASC, 3 ASC
            `,
            [experiment],
        )).rows as DataPoint[];

        const performance: Performance = {};
        for (const row of rows) {
            const { metric_name, treatment, count, avg, stddev } = row;
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
            if (!performance[metric_name][treatment]) {
                performance[metric_name][treatment] = []
            }
            performance[metric_name][treatment].push(row);
        }
        return performance;
    }
}

// NOTE: There should be 3 separate ways to do apply observations:
// 1. Look backward from now over a fixed time
// 2. Look backward from a certain point over a fixed time
// 3. Look between a range of times
