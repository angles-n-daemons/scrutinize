import { Request, Response, Router as ExpressRouter } from 'express';

import Controller from './controller';

// Async routing copied from: https://stackoverflow.com/a/57099213
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncHandler = (fn: any) => (req: Request, res: Response, next: any) => {
	return Promise
		.resolve(fn(req, res, next))
		.catch(next);
}
function toAsyncRouter(router: ExpressRouter) {
	const methods = [
		'get',
		'post',
		'delete'  // & etc.
	];

	for (const key in router) {
		if (methods.includes(key)) {
			// @ts-ignore
			const method = router[key];
			// @ts-ignore
			router[key] = (path, ...callbacks) => method.call(router, path, ...callbacks.map(cb => asyncHandler(cb)));
		}
	}
	return router
}

export default class Router {
	constructor(
		private controller: Controller,
	) {
		this.alive = this.alive.bind(this);
		this.health = this.health.bind(this);
		this.getExperiment = this.getExperiment.bind(this);
		this.postExperiment = this.postExperiment.bind(this);
		this.postTreatment = this.postTreatment.bind(this);
		this.postMeasurement = this.postMeasurement.bind(this);
		this.getMetrics = this.getMetrics.bind(this);
		this.getPerformance = this.getPerformance.bind(this);
	}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
		router.get('/alive', this.alive.bind(this));
		router.get('/health', this.health.bind(this));
		router.get('/experiment', this.getExperiment.bind(this));
		router.post('/experiment', this.postExperiment.bind(this));
		router.post('/experiment/active', this.postExperimentActive.bind(this));
		router.post('/treatment', this.postTreatment.bind(this));
		router.post('/measurement', this.postMeasurement.bind(this));
		router.get('/metrics', this.getMetrics.bind(this));
		router.get('/details/:experiment', this.getDetails.bind(this));
		router.get('/performance/:experiment', this.getPerformance.bind(this));
		return router;
	}

	private async alive(_: Request, res: Response) {
		res.json({status: 'ok'});
	}

	private async health(_: Request, res: Response) {
		try {
			const healthy = await this.controller.healthy();
			if (!healthy) {
				res.status(500).json({status: 'not ok'});
			}
			res.json({status: 'ok'});
		} catch (e) {
			console.log(e);
			res.status(500).json({status: 'not ok'});
		}
	}

	private async getExperiment(_: Request, res: Response) {
		res.json(await this.controller.getExperiments());
	}

	private async postExperiment(req: Request, res: Response) {
		await this.controller.createExperiment(req.body);
		res.json({status: 'ok'});
	}

    private async postExperimentActive(req: Request, res: Response) {
		await this.controller.createMeasurement(req.body);
		res.json({status: 'ok'});
    }

	private async postTreatment(req: Request, res: Response) {
		await this.controller.createTreatment(req.body);
		res.json({status: 'ok'});
	}

	private async postMeasurement(req: Request, res: Response) {
		await this.controller.createMeasurement(req.body);
		res.json({status: 'ok'});
	}

	private async getMetrics(_: Request, res: Response) {
		res.json(await this.controller.getMetrics());
	}

	private async getDetails(req: Request, res: Response) {
		res.json(await this.controller.getDetails(req.params.experiment || ''));
	}

	private async getPerformance(req: Request, res: Response) {
		res.json(await this.controller.getPerformance(req.params.experiment || ''));
	}
}
