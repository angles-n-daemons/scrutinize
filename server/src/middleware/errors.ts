/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
import { Request, Response } from 'express';

export function UserError(err: Error | null = null, userMsg: string = ''): Error {
    if (err == null) {
        err = new Error();
    }
    var newErr = new (<any>err.constructor)();
    newErr = Object.assign(newErr, err);
    newErr.userMsg = userMsg;
    return newErr;
}

export default function errorMiddleware(err: Error, _: Request, res: Response, next: Function): void {
    if (res.headersSent || !res.status){ next(err); }

    console.error(err.stack)
    console.error(err.message)
    var userMsg = 'Unable to handle request';
    console.log(err);
    if ('userMsg' in err) {
        userMsg = err['userMsg'];
    }
    res.status(500).send({
        'error': `Unknown ${err.constructor.name} thrown`,
        'userMsg': userMsg,
    });
}
