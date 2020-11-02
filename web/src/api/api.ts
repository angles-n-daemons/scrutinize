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
 

class API {
    async getExperiments(search: string='') {
        return await fetch(`${BASE_PATH}/experiment`);
    }
    async getPerformance(experiment: string): Promise<Record<string, PerformanceData>> {
        return await(await fetch(`${BASE_PATH}/performance/${experiment}`)).json() as Record<string, PerformanceData>;
    }
}

export default new API();
