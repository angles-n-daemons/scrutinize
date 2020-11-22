import { Request, Response, Router as ExpressRouter } from 'express';

import ReportingController from 'controller/reporting';
import toAsyncRouter from '../middleware/asyncRouter'

export default class ReportingRouter {
	constructor(
		private controller: ReportingController,
	) {}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
        console.log('giving routes');
		router.get('/details/:experiment', this.getDetails.bind(this));
		router.get('/performance/:experiment', this.getPerformance.bind(this));
		return router;
	}

	private async getDetails(req: Request, res: Response) {
		res.json(await this.controller.getDetails(req.params.experiment || ''));
	}

	private async getPerformance(req: Request, res: Response) {
		res.json(await this.controller.getPerformance(req.params.experiment || ''));
	}
}
