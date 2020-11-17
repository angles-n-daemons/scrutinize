const BASE_PATH = '/api/v1'

export interface Experiment {
    id?: number;
    name: string;
    percentage: number;
    evaluation_criterion: Metric[];
}

export interface Metric {
    id: number;
    name: string;
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
}

class API {
    async saveExperiment(experiment: Experiment) {
        console.log('saving')
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

    async getExperiments(search: string='') { 
        return await fetch(`${BASE_PATH}/experiment`);
    }

    async getMetrics(): Promise<Metric[]> {
        return (await fetch(`${BASE_PATH}/metrics`)).json();
    }

    async getDetails(experiment: string): Promise<ExperimentDetails> {
        return await(await fetch(`${BASE_PATH}/details/${experiment}`)).json() as ExperimentDetails;
    }

    async getPerformance(experiment: string): Promise<Record<string, PerformanceData>> {
        return await(await fetch(`${BASE_PATH}/performance/${experiment}`)).json() as Record<string, PerformanceData>;
    }
}

export default new API();
