import { Store } from './store';
import {
    Experiment,
    Metric,
    Observation,
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

    public async createExperiment(experiment: Experiment) {
        await this.store.createExperiment(experiment);
    }

    public async createTreatment(treatment: Treatment) {
        await this.store.createTreatment(treatment);
    }

    public async createObservation(observation: Observation) {
        const { experiment_name, metric_name } = observation;
        await this.store.upsertMetric({
            experiment_name,
            name: metric_name,
        });
        await this.store.createObservation(observation);
    }

    public async getMetrics(): Promise<Metric[]> {
        return await this.store.getMetrics();
    }

    public async getPerformance(experiment: string): Promise<Performance> {
        return await this.store.getPerformance(experiment);
    }
}
