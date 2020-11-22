import { Request, Response, Router as ExpressRouter } from 'express';

import ExperimentController from 'controller/experiment';
import toAsyncRouter from '../middleware/asyncRouter'

export default class ExperimentRouter {
	constructor(
		private controller: ExperimentController,
	) {}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
		router.get('/experiment', this.getExperiment.bind(this));
		router.post('/experiment', this.postExperiment.bind(this));
		router.post('/experiment/active', this.postExperimentActive.bind(this));
		router.post('/treatment', this.postTreatment.bind(this));
		return router;
	}

	private async getExperiment(_: Request, res: Response) {
		res.json(await this.controller.getExperiments());
	}

	private async postExperiment(req: Request, res: Response) {
		await this.controller.createExperiment(req.body);
		res.json({status: 'ok'});
	}

    private async postExperimentActive(req: Request, res: Response) {
		await this.controller.toggleExperimentActive(req.body);
		res.json({status: 'ok'});
    }

	private async postTreatment(req: Request, res: Response) {
		await this.controller.createTreatment(req.body);
		res.json({status: 'ok'});
	}
}
