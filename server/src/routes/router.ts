import { Request, Response, Router as ExpressRouter } from 'express';

import Controller from 'controller/controller';
import toAsyncRouter from '../middleware/asyncRouter'

export default class Router {
	constructor(
		private controller: Controller,
	) {}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
		router.post('/measurement', this.postMeasurement.bind(this));
		router.get('/metric', this.getMetrics.bind(this));
		router.post('/metric', this.postMetric.bind(this));
		router.get('/details/:experiment', this.getDetails.bind(this));
		router.get('/performance/:experiment', this.getPerformance.bind(this));
		return router;
	}

	private async postMeasurement(req: Request, res: Response) {
		await this.controller.createMeasurement(req.body);
		res.json({status: 'ok'});
	}

	private async getMetrics(_: Request, res: Response) {
		res.json(await this.controller.getMetrics());
	}

	private async postMetric(req: Request, res: Response) {
		await this.controller.createMetric(req.body);
		res.json({status: 'ok'});
	}

	private async getDetails(req: Request, res: Response) {
		res.json(await this.controller.getDetails(req.params.experiment || ''));
	}

	private async getPerformance(req: Request, res: Response) {
		res.json(await this.controller.getPerformance(req.params.experiment || ''));
	}
}
