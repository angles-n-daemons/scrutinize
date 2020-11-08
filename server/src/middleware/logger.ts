import { Request, Response } from 'express';
import chalk from 'chalk';

const getDurationInMilliseconds = (start: [number, number]) => {
    const NS_PER_SEC = 1e9; // convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

function getRequestLog(
    method: string,
    url: string,
    formatted_date: string,
    status: number,
    start: [number, number],
) {
    const durationInMilliseconds = getDurationInMilliseconds(start)
    const statusStr = status > 380 ? chalk.redBright(status) : chalk.greenBright(status);
    const durationStr = durationInMilliseconds > 1000 ? chalk.redBright(durationInMilliseconds) : chalk.greenBright(durationInMilliseconds);
    return `[${chalk.cyan(formatted_date)}] ${method} ${url} ${statusStr} ${durationStr}`;
}

export default function logMiddleware(req: Request, res: Response, next: () => void): void {
    const current_datetime = new Date();
    const formatted_date =
        current_datetime.getFullYear() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getDate() +
        " " +
        current_datetime.getHours() +
        ":" +
        current_datetime.getMinutes() +
        ":" +
        current_datetime.getSeconds();
    const method = req.method;
    const url = req.url;
    const start = process.hrtime();
    let logged = false;

    res.on('finish', () => {            
        if (!logged) {
            const status = res.statusCode;
            console.log(getRequestLog(method, url, formatted_date, status, start));
            logged = true;
        }
    })

    res.on('close', () => {
        if (!logged) {
            const status = res.statusCode;
            console.log(getRequestLog(method, url, formatted_date, status, start));
            logged = true;
        }
    })

    next();
}
