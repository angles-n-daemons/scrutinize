import { Store } from './store';
import {
    Experiment,
    Metric,
    Measurement,
    Details,
    Performance,
    Treatment,
} from './model';

export default class Controller {
    constructor (
        private store: Store,
    ) {}

    public async healthy(): Promise<boolean> {
        return await this.store.healthy();
    }

    public async getExperiments(): Promise<Experiment[]> {
        return await this.store.getExperiments();
    }

    public async createExperiment(experiment: Experiment): Promise<void> {
        await this.store.createExperiment(experiment);
    }

    public async toggleExperimentActive(experiment: Experiment): Promise<void> {
        await this.store.toggleExperimentActive(experiment);
    }

    public async createTreatment(treatment: Treatment): Promise<void> {
        await this.store.createTreatment(treatment);
    }

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

    public async getDetails(experiment: string): Promise<Details> {
        return await this.store.getDetails(experiment);
    }

    public async getPerformance(experiment: string): Promise<Performance> {
        return await this.store.getPerformance(experiment);
    }
}
