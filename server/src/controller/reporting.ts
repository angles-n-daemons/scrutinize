import ReportingStore from 'database/reporting';
import {
    Details,
    Performance,
} from 'database/model';

export default class ReportingController {
    constructor (
        private store: ReportingStore,
    ) {}

    public async getDetails(experiment: string): Promise<Details> {
        return await this.store.getDetails(experiment);
    }

    public async getPerformance(experiment: string): Promise<Performance> {
        return await this.store.getPerformance(experiment);
    }
}
