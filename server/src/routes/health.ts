import { Request, Response, Router as ExpressRouter } from 'express';
import { Pool } from 'pg';

import toAsyncRouter from '../middleware/asyncRouter'

export default class HealthRouter {
	constructor(
		private pool: Pool,
	) {}

	public routes(): ExpressRouter {
		const router = toAsyncRouter(ExpressRouter());
		router.get('/alive', this.alive.bind(this));
		router.get('/health', this.health.bind(this));
		return router;
	}

	private async alive(_: Request, res: Response) {
		res.json({status: 'ok'});
	}

	private async health(_: Request, res: Response) {
		try {
            await this.pool.query(`SELECT id FROM Experiment LIMIT 1`);
			res.json({status: 'ok'});
		} catch (e) {
			console.log(e);
			res.status(500).json({status: 'not ok'});
		}
	}
}
