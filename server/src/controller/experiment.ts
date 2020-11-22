import ExperimentStore from 'database/experiment';
import {
    Experiment,
    Treatment,
} from 'database/model';

export default class ExperimentController {
    constructor (
        private store: ExperimentStore,
    ) {}

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
}
