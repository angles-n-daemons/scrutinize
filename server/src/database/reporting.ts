import { Pool } from 'pg';

import {
    Run,
    Metric,
    VariantDetails,
    Details,
    Performance,
    DataPoint,
} from 'database/model';

export default class ReportingStore {
    constructor (
        private pool: Pool,
    ) {}

    public async getDetails(runID: number): Promise<Details> {
		const details: Details = (await this.pool.query(
            `SELECT e.id, e.name, r.percentage, r.started_time, r.ended_time
               FROM Experiment e
               JOIN Run r ON r.experiment_id=e.id
               WHERE r.id=$1`,
            [runID],
        )).rows[0] as Details;

        details.variants = (await this.pool.query(
            `SELECT variant,
                    COUNT(*) as volume,
                    COUNT(DISTINCT user_id) AS unique_users,
                    AVG(duration_ms) as duration_ms,
                    1.0 * SUM(CASE WHEN LENGTH(error) > 0 THEN 1 ELSE 0 END) / COUNT(*) as pct_error
               FROM Treatment
              WHERE run_id=$1
              GROUP BY variant`,
            [runID],
        )).rows as VariantDetails[];

        details.evaluation_criterion = (await this.pool.query(
            `SELECT id, name, type
               FROM Metric m
               JOIN EvaluationCriterion ec ON ec.metric_id = m.id
              WHERE ec.run_id=$1`,
            [runID],
        )).rows as Metric[];

        return details;
    }

    public async getPerformance(runID: number, metric: string): Promise<Performance> {
		const run = (await this.pool.query(
            `
            SELECT id, started_time, ended_time
            FROM Run
            WHERE id=$1
            `,
            [runID],
        )).rows[0] as Run;

        /*
         * With the following query, we preselect a TreatmentLookup
         * This lookup is used to match measurements to treatments
         * using the user_id associated with both.
         *
         * It is using this mechanism that we are able to partition
         * the measurement data between control and experiment.
         */
		const rows = (await this.pool.query(
            `
            WITH TreatmentLookup AS (
                SELECT t.user_id, t.variant
                  FROM Treatment t
                  JOIN Run r ON r.id=t.run_id
                 WHERE r.id=$1
            )
            SELECT DATE(m.created_time), tl.variant, COUNT(*), AVG(value), STDDEV(value)
              FROM Measurement m
              JOIN TreatmentLookup tl ON tl.user_id=m.user_id
             WHERE m.created_time BETWEEN COALESCE($2, CURRENT_TIMESTAMP) AND COALESCE($3, CURRENT_TIMESTAMP) AND
                   m.metric_name=$4
             GROUP BY 1, 2
             ORDER BY 1 ASC, 2 ASC
            `,
            [runID, run.started_time, run.ended_time, metric],
        )).rows as DataPoint[];

        const performance: Performance = {
            control: [],
            experiment: [],
        };

        for (const row of rows) {
            const { variant, count, avg, stddev } = row;
            // data transformation - node-postgres returns strings
            row.count = parseFloat(count as unknown as string);
            row.avg = parseFloat(avg as unknown as string);
            row.stddev = parseFloat(stddev as unknown as string);

            performance[variant].push(row);
        }
        return performance;
    }
}
