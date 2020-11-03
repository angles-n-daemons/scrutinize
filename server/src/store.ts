import { Client } from 'pg';

import {
    Experiment,
    Metric,
    Observation,
    Performance,
    Treatment,
} from './model';

export interface Store {
    getExperiments: () => Promise<Experiment[]>;
    createExperiment: (data: Experiment) => Promise<void>;
    createTreatment: (data: Treatment) => Promise<void>;
    createObservation: (data: Observation) => Promise<void>;
    upsertMetric: (data: Metric) => Promise<void>;
    getMetrics: () => Promise<Metric[]>;
    getPerformance: (experiment_name: string) => Promise<Performance>;
    healthy: () => Promise<boolean>;
}

export class PGStore {
    constructor (
        private db: Client,
    ) {}

    public async getExperiments(): Promise<Experiment[]> {
		return (await this.db.query(
            `SELECT id, name, percentage, created_time, last_active_time FROM Experiment`
        )).rows;
    }

    public async createExperiment(experiment: Experiment) {
		await this.db.query(
            `
            INSERT INTO Experiment(name, percentage)
            VALUES ($1, $2)
            `,
            [experiment.name, experiment.percentage],
        );
        await this.db.query('COMMIT');
    }

    public async createTreatment(t: Treatment) {
        const { user_id, treatment, error, experiment_name } = t;
		await this.db.query(
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
        await this.db.query('COMMIT');
    }

    public async upsertMetric(metric: Metric) {
        const { name, experiment_name } = metric;
		await this.db.query(
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
        await this.db.query('COMMIT');
    }

    public async createObservation(observation: Observation) {
        const { metric_name, value, user_id, experiment_name } = observation;
        await this.db.query('BEGIN');
		await this.db.query(
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
        await this.db.query('COMMIT');
    }

    public async getMetrics(): Promise<Metric[]> {
        return [];
    }

    public async getPerformance(): Promise<Performance> {
        return {};
    }

    public async healthy(): Promise<boolean> {
		const rows = (await this.db.query(
            `SELECT COUNT(*) FROM Experiment`
        )).rows;
 
        return rows.length === 1;
    }
}

// NOTE: There should be 3 separate ways to do apply observations:
// 1. Look backward from now over a fixed time
// 2. Look backward from a certain point over a fixed time
// 3. Look between a range of times
