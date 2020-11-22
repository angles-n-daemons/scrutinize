import { Request, Response, Router as ExpressRouter } from 'express';

import MetricController from 'controller/metric';
import toAsyncRouter from '../middleware/asyncRouter'

export default class MetricRouter {
	constructor(
		private controller: MetricController,
	) {}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
		router.post('/measurement', this.postMeasurement.bind(this));
		router.get('/metric', this.getMetrics.bind(this));
		router.post('/metric', this.postMetric.bind(this));
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
}
