/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
import { Request, Response } from 'express';

export default function errorMiddleware(err: Error, _: Request, res: Response): void {
    if (res.headersSent){ return; }

    console.error(err.stack)
    res.status(500).send({'error': `Unknown ${err.constructor.name} thrown`});
}
