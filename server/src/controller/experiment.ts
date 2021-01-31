import ExperimentStore from 'database/experiment';
import {
    Experiment,
    Run,
    Treatment,
} from 'database/model';

import { UserError } from '../middleware/errors';

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

    public async startExperiment(run: Run): Promise<void> {
        const experiment = await this.store.getExperiment(run.experiment_id);

        if (!experiment) {
            throw(UserError(null, `Unable to find experiment with id ${run.experiment_id}`));
        }

        if (experiment.active) {
            throw(UserError(null, 'Experiment already running'));
        }

        await this.store.startExperiment(run);
    }

    public async endExperiment({ id }: Experiment): Promise<void> {
        const experiment = await this.store.getExperiment(id as number);

        if (!experiment) {
            throw(UserError(null, `Unable to find experiment with id ${id}`));
        }
        if (!experiment.active) {
            throw(UserError(null, 'Experiment not running'));
        }

        await this.store.endExperiment(id as number);
    }

    public async createTreatment(treatment: Treatment): Promise<void> {
        if (!treatment.run_id) {
            return
        }
        await this.store.createTreatment(treatment);
    }
}
