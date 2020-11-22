import { Store } from 'database/store';
import {
    Metric,
    Measurement,
    Details,
    Performance,
} from 'database/model';

export default class Controller {
    constructor (
        private store: Store,
    ) {}

    public async createMeasurement(measurement: Measurement): Promise<void> {
        const { metric_name } = measurement;
        await this.store.upsertMetric({
            name: metric_name,
        });
        await this.store.createMeasurement(measurement);
    }

    public async getMetrics(): Promise<Metric[]> {
        return await this.store.getMetrics();
    }

    public async createMetric(metric: Metric): Promise<void> {
        await this.store.createMetric(metric);
    }


    public async getDetails(experiment: string): Promise<Details> {
        return await this.store.getDetails(experiment);
    }

    public async getPerformance(experiment: string): Promise<Performance> {
        return await this.store.getPerformance(experiment);
    }
}
