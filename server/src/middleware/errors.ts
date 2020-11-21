/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
import { Request, Response } from 'express';

export function UserError(err: Error, userError: string): Error {
    var newErr = new (<any>err.constructor)();
    newErr = Object.assign(newErr, err);
    newErr.userError = userError;
    return newErr;
}

export default function errorMiddleware(err: Error, _: Request, res: Response, next: Function): void {
    if (res.headersSent || !res.status){ next(err); }

    console.error(err.stack)
    console.error(err.message)
    var userError = 'Unable to handle request';
    console.log(err);
    if ('userError' in err) {
        userError = err['userError'];
    }
    res.status(500).send({
        'error': `Unknown ${err.constructor.name} thrown`,
        'userError': userError,
    });
}
