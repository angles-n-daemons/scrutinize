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

import { UserError } from './middleware/errors';

export interface Store {
    healthy: () => Promise<boolean>;
    getExperiments: () => Promise<Experiment[]>;
    createExperiment: (data: Experiment) => Promise<void>;
    toggleExperimentActive: (data: Experiment) => Promise<void>;
    createTreatment: (data: Treatment) => Promise<void>;
    createMeasurement: (data: Measurement) => Promise<void>;
    createMetric: (data: Metric) => Promise<void>;
    upsertMetric: (data: Metric) => Promise<void>;
    getMetrics: () => Promise<Metric[]>;
    getDetails: (experiment: string) => Promise<Details>;
    getPerformance: (experiment: string) => Promise<Performance>;
}

export class PGStore {
    constructor (
        private pool: Pool,
    ) {}

    public async healthy(): Promise<boolean> {
		const rows = (await this.pool.query(
            `SELECT id FROM Experiment LIMIT 1`
        )).rows;
 
        return rows.length === 1;
    }

    public async getExperiments(): Promise<Experiment[]> {
		return (await this.pool.query(
            `
            SELECT id, name, percentage, active, started_time, ended_time
            FROM Experiment
            ORDER BY id DESC
            `
        )).rows;
    }

    public async createExperiment(experiment: Experiment): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query(
                `
                INSERT INTO Experiment(name, percentage, active)
                VALUES ($1, $2, FALSE)
                RETURNING id
                `,
                [experiment.name, experiment.percentage],
            );
            // NOTE: pg-node prepared statements don't support execution for multiple values i think
            for (const metric of experiment.evaluation_criterion || []) {
                await client.query(
                    `
                    INSERT INTO EvaluationCriterion (experiment_id, metric_id)
                    VALUES ($1, $2)
                    `,
                    [res.rows[0].id, metric.id],
                );
            }
            await client.query('COMMIT');
        } catch (e: any) {
            if (e instanceof Error) {
                if (e.message.indexOf('unique constraint') !== -1) {
                    e = UserError(e, 'Experiment name taken, please choose a different one');
                }
            }
            await client.query('ROLLBACK');
            throw(e);
        } finally {
            client.release();
        }
    }

    public async toggleExperimentActive({ id, active }: Experiment): Promise<void> {
        var query = '', params = [active, id];
        if (active) {
            query = `UPDATE Experiment
                        SET active=$1, run_count=run_count+1, started_time=CURRENT_TIMESTAMP, ended_time=NULL
                      WHERE id=$2`
        } else {
            query = `UPDATE Experiment
                        SET active=$1, ended_time=CURRENT_TIMESTAMP
                      WHERE id=$2`
        }
	    await this.pool.query(query, params);
    }

    public async createTreatment(t: Treatment): Promise<void> {
        // TODO: Add experiment_run to the insert
        const { user_id, variant, error, duration_ms, experiment_name } = t;
		await this.pool.query(
            `
            INSERT INTO Treatment(
                user_id,
                variant,
                error,
                duration_ms,
                experiment_id,
                experiment_run
            )
            SELECT $1, $2, $3, $4, id, run_count
              FROM experiment e
             WHERE e.name=$5
            `,
            [user_id, variant, error, duration_ms, experiment_name],
        );
    }

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
        // TODO: Complete rewrite
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

    public async getDetails(experiment: string): Promise<Details> {
		const details: Details = (await this.pool.query(
            `SELECT id, name, percentage, started_time, ended_time
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
		const exp = (await this.pool.query(
            `
            SELECT id, started_time, ended_time
            FROM Experiment
            WHERE name=$1
            `,
            [experiment],
        )).rows as Experiment[];
        if (exp.length !== 1) {
            throw UserError(Error('PGStore.getPerformance: incorrect number of experiments'), 'Unable to complete your request');
        }

		const rows = (await this.pool.query(
            `
            WITH TreatmentLookup AS (
                SELECT t.user_id, t.variant
                  FROM Treatment t
                  JOIN Experiment e ON e.id=t.experiment_id AND t.experiment_run=e.run_count
                 WHERE e.id=$1
            )
            SELECT m.metric_name, DATE(m.created_time), tl.variant, COUNT(*), AVG(value), STDDEV(value)
              FROM Measurement m
              JOIN TreatmentLookup tl ON tl.user_id=m.user_id
             WHERE m.created_time BETWEEN COALESCE($2, CURRENT_TIMESTAMP) AND COALESCE($3, CURRENT_TIMESTAMP)
             GROUP BY 1, 2, 3
             ORDER BY 1, 2 ASC, 3 ASC
            `,
            [exp[0].id, exp[0].started_time, exp[0].ended_time],
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
