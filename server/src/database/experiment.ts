import { Pool } from 'pg';

import {
    Experiment,
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
            SELECT e.id, e.name, e.percentage, e.active, run.started_time, run.ended_time
              FROM Experiment e
              LEFT JOIN (
                   SELECT experiment_id, MAX(started_time) as started_time, MAX(ended_time) as ended_time
                     FROM Run
                    GROUP BY experiment_id
                   ) as run ON run.experiment_id = e.id
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

    public async toggleExperimentActive({ id }: Experiment): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`SELECT pg_advisory_lock($1)`, [id]);
            const experiment = (await client.query(`
                SELECT id, active, run_count
                  FROM Experiment
                 WHERE id=$1
            `, [id])).rows[0] as Experiment;

            if (experiment.active) {
                // end current run
                await client.query(`
                    UPDATE Experiment
                       SET active=false
                     WHERE id=$1
                `, [id]);
                await client.query(`
                    UPDATE Run
                       SET ended_time=CURRENT_TIMESTAMP
                     WHERE experiment_id=$1 AND
                           run_count=$2
                `, [id, experiment.run_count]);
            } else {
                // start new run
                const new_run_count = experiment.run_count + 1;
                await client.query(`
                    UPDATE Experiment
                       SET run_count=$1,
                           active=true
                     WHERE id=$2
                `, [new_run_count, id]);
                await client.query(`
                    INSERT INTO Run(experiment_id, run_count)
                    VALUES ($1, $2)
                `, [id, new_run_count]);
            }
            await client.query('COMMIT');
        } catch (e: any) {
            await client.query('ROLLBACK');
            throw(e);
        } finally {
            await client.query(`SELECT pg_advisory_unlock($1)`, [id]);
            client.release();
        }
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
                experiment_id,
                experiment_run
            )
            SELECT $1, $2, $3, $4, id, run_count
              FROM experiment e
             WHERE e.name=$5
            `,
            [user_id, variant, error, duration_ms, experiment_name],
        );
        throw(Error("fix treatment logic"));
    }
}
