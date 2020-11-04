import { Request, Response } from 'express';

export default function errorMiddleware(err: Error, _: Request, res: Response, __: Function) {
    if (res.headersSent){ return; }

    console.error(err.stack)
    res.status(500).send({'error': `Unknown ${err.constructor.name} thrown`});
}
