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
		//return (await this.pool.query(
		(await this.pool.query(
            `
            SELECT id, name, percentage, active, started_time, ended_time
            FROM Experiment
            ORDER BY id DESC
            `
        )).rows;
        throw(Error("fix experiment list logic"));
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
        throw(Error("fix toggle logic"));
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
