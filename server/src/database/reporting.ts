import { Pool } from 'pg';

import {
    //Experiment,
    //Metric,
    //VariantDetails,
    Details,
    Performance,
    //DataPoint,
} from 'database/model';

//import { UserError } from '../middleware/errors';

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
        return details;

        //details.variants = (await this.pool.query(
        //    `SELECT variant,
        //            COUNT(*) as volume,
        //            COUNT(DISTINCT user_id) AS unique_users,
        //            AVG(duration_ms) as duration_ms,
        //            1.0 * SUM(CASE WHEN LENGTH(error) > 0 THEN 1 ELSE 0 END) / COUNT(*) as pct_error
        //       FROM Treatment
        //      WHERE experiment_id=(SELECT id FROM Experiment WHERE name=$1)
        //      GROUP BY variant`,
        //    [experiment],
        //)).rows as VariantDetails[];

        //details.evaluation_criterion = (await this.pool.query(
        //    `SELECT id, name, type
        //       FROM Metric m
        //       JOIN EvaluationCriterion ec ON ec.metric_id = m.id
        //      WHERE ec.experiment_id=(SELECT id FROM Experiment WHERE name=$1)`,
        //    [experiment],
        //)).rows as Metric[];

        ////return details;
        //throw(Error("Use run now"));
    }

    public async getPerformance(experiment: string, metric: string): Promise<Performance> {
        console.log(experiment, metric);
        return {} as unknown as Performance;
		//const exp = (await this.pool.query(
        //    `
        //    SELECT id, started_time, ended_time
        //    FROM Experiment
        //    WHERE name=$1
        //    `,
        //    [experiment],
        //)).rows as Experiment[];
        //if (exp.length !== 1) {
        //    throw UserError(Error('PGStore.getPerformance: incorrect number of experiments'), 'Unable to complete your request');
        //}

        ///*
        // * With the following query, we preselect a TreatmentLookup
        // * This lookup is used to match measurements to treatments
        // * using the user_id associated with both.
        // *
        // * It is using this mechanism that we are able to partition
        // * the measurement data between control and experiment.
        // */
		//const rows = (await this.pool.query(
        //    `
        //    WITH TreatmentLookup AS (
        //        SELECT t.user_id, t.variant
        //          FROM Treatment t
        //          JOIN Experiment e ON e.id=t.experiment_id AND t.experiment_run=e.run_count
        //         WHERE e.id=$1
        //    )
        //    SELECT DATE(m.created_time), tl.variant, COUNT(*), AVG(value), STDDEV(value)
        //      FROM Measurement m
        //      JOIN TreatmentLookup tl ON tl.user_id=m.user_id
        //     WHERE m.created_time BETWEEN COALESCE($2, CURRENT_TIMESTAMP) AND COALESCE($3, CURRENT_TIMESTAMP) AND
        //           m.metric_name=$4
        //     GROUP BY 1, 2
        //     ORDER BY 1 ASC, 2 ASC
        //    `,
        //    [exp[0].id, exp[0].started_time, exp[0].ended_time, metric],
        //)).rows as DataPoint[];

        //const performance: Performance = {
        //    control: [],
        //    experiment: [],
        //};

        //for (const row of rows) {
        //    const { variant, count, avg, stddev } = row;
        //    // data transformation - node-postgres returns strings
        //    row.count = parseFloat(count as unknown as string);
        //    row.avg = parseFloat(avg as unknown as string);
        //    row.stddev = parseFloat(stddev as unknown as string);

        //    performance[variant].push(row);
        //}
        ////return performance;
        //throw(Error("Use run now"));
    }
}
