import { Request, Response } from 'express';

import { DatabaseError } from 'ts-postgres';

export class InputDataError extends Error {
    constructor(
        datatype: string,
    ) {
        super(`request data improperly formed for ${datatype}`);
    }
}

export default function errorMiddleware(err: Error, _: Request, res: Response, __: Function) {
    if (res.headersSent){ return; }

    console.error(err.stack)
    if (err instanceof InputDataError) {
        res.status(400).send({'error': err.toString()});
    } else if (err instanceof DatabaseError) {
        res.status(500).send({'error': 'Unhandled database error'});
    } else {
        res.status(500).send({'error': `Unknown ${err.constructor.name} thrown`});
    }
}
