import MetricStore from 'database/metric';
import {
    Metric,
    Measurement,
} from 'database/model';

export default class MetricController {
    constructor (
        private store: MetricStore,
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
}
