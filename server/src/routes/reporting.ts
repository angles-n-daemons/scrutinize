import { Request, Response, Router as ExpressRouter } from 'express';

import Controller from 'controller/controller';
import toAsyncRouter from '../middleware/asyncRouter'

export default class ReportingRouter {
	constructor(
		private controller: Controller,
	) {}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
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
