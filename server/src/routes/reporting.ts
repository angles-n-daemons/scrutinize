import { Request, Response, Router as ExpressRouter } from 'express';

import ReportingController from 'controller/reporting';
import toAsyncRouter from '../middleware/asyncRouter'

export default class ReportingRouter {
	constructor(
		private controller: ReportingController,
	) {}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
		router.get('/details/:run_id', this.getDetails.bind(this));
		router.get('/performance/:run_id/:metric', this.getPerformance.bind(this));
		return router;
	}

	private async getDetails(req: Request, res: Response) {
		res.json(await this.controller.getDetails(parseInt(req.params.run_id || '0')));
	}

	private async getPerformance(req: Request, res: Response) {
		res.json(await this.controller.getPerformance(
            parseInt(req.params.run_id || '0'),
            req.params.metric || '',
        ));
	}
}
