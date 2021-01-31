import ReportingStore from 'database/reporting';
import {
    Details,
    Performance,
} from 'database/model';

export default class ReportingController {
    constructor (
        private store: ReportingStore,
    ) {}

    public async getDetails(runID: number): Promise<Details> {
        return await this.store.getDetails(runID);
    }

    public async getPerformance(runID: number, metric: string): Promise<Performance> {
        return await this.store.getPerformance(runID, metric);
    }
}
