import { Request, Response, Router as ExpressRouter } from 'express';

// Async routing copied from: https://stackoverflow.com/a/57099213
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncHandler = (fn: any) => (req: Request, res: Response, next: any) => {
	return Promise
		.resolve(fn(req, res, next))
		.catch(next);
}

export default function toAsyncRouter(router: ExpressRouter) {
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


