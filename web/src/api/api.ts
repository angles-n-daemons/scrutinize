const BASE_PATH = '/api/v1'

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
    async getExperiments(search: string='') { 
        return await fetch(`${BASE_PATH}/experiment`);
    }
    async getDetails(experiment: string): Promise<ExperimentDetails> {
        return await(await fetch(`${BASE_PATH}/details/${experiment}`)).json() as ExperimentDetails;
    }
    async getPerformance(experiment: string): Promise<Record<string, PerformanceData>> {
        return await(await fetch(`${BASE_PATH}/performance/${experiment}`)).json() as Record<string, PerformanceData>;
    }
}

export default new API();
