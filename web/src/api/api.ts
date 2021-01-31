const BASE_PATH = '/api/v1';

export interface Experiment {
    id?: number;
    name: string;
    description: string;
    active?: boolean;
}

export interface ExperimentConfig {
    id?: number;
    experiment_id: number;
    percentage: number;
    metrics: Metric[];
}

export interface Metric {
    id?: number;
    name: string;
    type?: 'binomial' | 'continuous' | 'count';
}

export interface PerformanceData {
    control: Array<DataPoint>;
    experiment: Array<DataPoint>;
}

export interface DataPoint {
    date: string;
    count: number;
    avg: number;
    stddev: number;
}

export interface VariantDetails {
    variant: string;
    volume: string;
    unique_users: string;
    duration_ms: string;
    pct_error: string;
}

export interface ExperimentDetails {
    name: string;
    percentage: number;
    active: boolean;
    created_time: string;
    last_active_time: string;
    variants: VariantDetails[];
    evaluation_criterion: Metric[];
}

class API {
    async getExperiments(search: string=''): Promise<Experiment[]> { 
        return (await (await fetch(`${BASE_PATH}/experiment`)).json()) as Experiment[];
    }

    async saveExperiment(experiment: Experiment): Promise<string> {
        const res = await fetch(`${BASE_PATH}/experiment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(experiment),
        });
        if (res.status > 399) {
            const data = await res.json()
            if ('userError' in data) {
                return data['userError'];
            } else {
                return 'Unknown server error';
            }
        }
        return '';
    }

    async startExperiment(config: ExperimentConfig): Promise<string> {
        const res = await fetch(`${BASE_PATH}/experiment/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });
        if (res.status > 399) {
            const data = await res.json()
            if ('userError' in data) {
                return data['userError'];
            } else {
                return 'Unknown server error';
            }
        }
        return '';
    }

    async endExperiment(experiment_id: number): Promise<string> {
        const res = await fetch(`${BASE_PATH}/experiment/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: experiment_id }),
        });
        if (res.status > 399) {
            const data = await res.json()
            if ('userError' in data) {
                return data['userError'];
            } else {
                return 'Unknown server error';
            }
        }
        return '';
    }

    async toggleExperimentActive(experiment: Experiment) {
        await fetch(`${BASE_PATH}/experiment/active`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(experiment),
        });
    }

    async getMetrics(): Promise<Metric[]> {
        return (await fetch(`${BASE_PATH}/metric`)).json();
    }

    async saveMetric(metric: Metric): Promise<string> {
        const res = await fetch(`${BASE_PATH}/metric`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metric),
        });
        if (res.status > 399) {
            const data = await res.json()
            if ('userError' in data) {
                return data['userError'];
            } else {
                return 'Unknown server error';
            }
        }
        return '';
    }

    async getDetails(experiment: string): Promise<ExperimentDetails> {
        return await(await fetch(`${BASE_PATH}/details/${experiment}`)).json() as ExperimentDetails;
    }

    async getPerformance(experiment: string, metric: string): Promise<PerformanceData> {
        return await(await fetch(`${BASE_PATH}/performance/${experiment}/${metric}`)).json() as PerformanceData;
    }
}

export default new API();
