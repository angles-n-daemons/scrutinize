import { Pool } from 'pg';

import {
    Experiment,
    VariantDetails,
    Details,
    Performance,
    DataPoint,
} from 'database/model';

import { UserError } from '../middleware/errors';

export default class ReportingStore {
    constructor (
        private pool: Pool,
    ) {}

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