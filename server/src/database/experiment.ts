import { Pool } from 'pg';

import {
    Experiment,
    Run,
    Treatment,
} from 'database/model';

import { UserError } from '../middleware/errors';

export default class ExperimentStore {
    constructor (
        private pool: Pool,
    ) {}

    public async getExperiments(): Promise<Experiment[]> {
		return (await this.pool.query(
            `
            SELECT e.id, e.name, e.active, r.id as run_id, r.percentage
              FROM Experiment e
              LEFT JOIN (
                   SELECT MAX(id) as id, experiment_id
                     FROM Run
                    GROUP BY experiment_id
                   ) as cr ON cr.experiment_id = e.id AND e.active
              LEFT JOIN Run r ON r.id=cr.id
             ORDER BY e.id DESC
            `
        )).rows;
    }

    public async createExperiment({ name, description }: Experiment): Promise<Experiment> {
        try {
            const id = (await this.pool.query(
                `
                INSERT INTO Experiment(name, description)
                VALUES ($1, $2)
                RETURNING id
                `,
                [name, description]
            )).rows[0].id as unknown as number;
            return {
                id,
                name,
                description,
                active: false,
            };
        } catch(e: any) {
            if (e instanceof Error) {
                if (e.message.indexOf('unique constraint') !== -1) {
                    e = UserError(e, 'Experiment name taken, please choose a different one');
                }
            }
            throw(e);
        }
    }

    public async startExperiment({
        experiment_id,
        percentage,
        metrics,
    }: Run): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `
                UPDATE Experiment
                   SET active=true
                 WHERE id=$1
                `,
                [experiment_id],
            );

            const res = await client.query(
                `
                INSERT INTO Run(experiment_id, percentage)
                VALUES ($1, $2)
                RETURNING id
                `,
                [experiment_id, percentage],
            );

            // NOTE: pg-node prepared statements don't support execution for multiple values i think
            for (const metric of metrics || []) {
                await client.query(
                    `
                    INSERT INTO EvaluationCriterion (run_id, metric_id)
                    VALUES ($1, $2)
                    `,
                    [res.rows[0].id, metric.id],
                );
            }
            await client.query('COMMIT');
        } catch (e: any) {
            await client.query('ROLLBACK');
            throw(e);
        } finally {
            client.release();
        }
    }

    public async endExperiment(experiment_id: number): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `
                UPDATE Experiment
                   SET active=false
                 WHERE id=$1
                `,
                [experiment_id],
            );

            await client.query(
                `
                UPDATE RUN
                   SET ended_time=CURRENT_TIMESTAMP
                 WHERE id=(SELECT MAX(id) FROM Run WHERE experiment_id=$1)
                `,
                [experiment_id],
            );

            await client.query('COMMIT');
        } catch (e: any) {
            await client.query('ROLLBACK');
            throw(e);
        } finally {
            client.release();
        }
    }

    public async createTreatment(t: Treatment): Promise<void> {
        const { user_id, run_id, variant, error, duration_ms } = t;
		await this.pool.query(
            `
            INSERT INTO Treatment(
                user_id,
                run_id,
                variant,
                error,
                duration_ms
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [user_id, run_id, variant, error, duration_ms],
        );
    }

    public async getExperiment(experiment_id: number): Promise<Experiment | null> {
		const rows = (await this.pool.query(
            `
            SELECT *
              FROM Experiment
             WHERE id=$1
            `,
            [experiment_id],
        )).rows;
        return rows.length ? rows[0] as unknown as Experiment : null;
    }
}
