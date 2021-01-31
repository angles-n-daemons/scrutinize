import axios, { AxiosInstance } from 'axios';
import md5 from 'md5';

interface Experiment {
    run_id: number | null;
    name: string;
    percentage: number;
    active: boolean;
}


export default class ScrutinizeClient {
    public axios: AxiosInstance;
    public experiments: Record<string, Experiment> | null = null;
    public experimentsPullTime = 0;

    constructor(
        apiURL: string='http://localhost:5001',
        public experimentsTTL: number=300,
    ) {
        this.axios = axios.create({
            baseURL: `${apiURL}/api/v1`,
            timeout: 3000,
        });
    }

     public async call(
        experimentName: string,
        userID: string,
        control: any,
        experiment: any,
        getTime: Function=Date.now,
    ): Promise<[boolean, any]> {
        /*
         * Primary entry point for an experiment. Behaves as follows:
         * 
         * 1. Given a user_id and experiment, determines whether the user should
         *    get the control or experiment behavior.
         * 2. Attempts to resolve the control or variant - can be functional
         *    or a literal value.
         * 3. After resolution is complete or has failed, records the treatment
         *    event to the server.
         * 
         * experimentName: name of experiment associated with the call
         * userID: identifying of the user who originated this request
         * control: function or literal value representing the control behavior
         * experiment: function or literal value representing the experiment behavior
         * getTime: method for getting the current time (overriden in testing)
         * 
         * return value: [user in experiment, value from variant]
         */
        const [isExperiment, variantStr] = await this.getVariant(experimentName, userID);
        const variant = isExperiment ? experiment : control;
        const startTime = getTime();
        var err: Error | null = null;
        try {
            return [isExperiment, await this.resolve(variant)];
        } catch (e: any) {
            err = e as Error;
            throw(e);
        } finally {
            const durationMS = (getTime() - startTime);
            await this.createTreatment(
                await this.getRunID(experimentName),
                userID,
                variantStr,
                durationMS,
                err === null ? '' : err.message,
            );
        }
    }

    public async getVariant(
        experimentName: string,
        userID: string,
    ): Promise<[boolean, string]> {
        /*
         * Determines whether the user is in the experiment group.
         *
         * experimentName: name of experiment associated with the call
         * userID: identifying of the user who originated this request
         *
         * return value: [user in experiment, string representing variant assignment]
        */
        const variantOperand = experimentName + userID;
        const experiments = await this.getExperiments();
        const experimentConfig = experiments[experimentName];
        var isExperiment = false;

        if (!experimentConfig) {
            console.log('ScrutinizeClient.getVariant: experiment not found, only control will be run')
        } else if (experimentConfig.active) {
            // convert id to a number between 0 and 99
            const hash = md5(variantOperand);
            const idInt = BigInt('0x' + hash) % BigInt(100);
            isExperiment = idInt < experimentConfig.percentage;
        }

        return [isExperiment, isExperiment ? 'experiment' : 'control'];
    }

    public  async getRunID(experimentName: string): Promise<number | null> {
        const experiments = await this.getExperiments();
        const experimentConfig = experiments[experimentName];
        return experimentConfig ? experimentConfig.run_id : null;
    }

    public async resolve(
        variant: any,
    ) {
        /*
         * Resolves an experiment behavior to a value.
         * 
         * variant: a function or literal value representing the variant behavior
         * 
         * return value: the resolved variant value
         */

        // have mercy on my soul
        if (variant instanceof Function) {
            if (variant.constructor.name === 'AsyncFunction') {
                return await variant();
            }
            return variant();
        }
        return variant;
    }

    public async getExperiments(): Promise<Record<string, Experiment>> {
        /*
         * Returns the experiment configuration stored in the server.
         * Has simple caching behavior.
         *
         * return value: a dictionary representing all experiment configurations
         */
        const now = Date.now() / 1000;
        const experiments = this.experiments || {};
        const shouldPull = !Boolean(this.experiments) || (now - this.experimentsPullTime > this.experimentsTTL);

        if (shouldPull) {
            const apiExperiments = (await this.axios.get('/experiment')).data;
            for (const exp of apiExperiments) {
                experiments[exp.name] = exp;
            }

            this.experiments = experiments;
            this.experimentsPullTime = now;
        }

        return experiments;
    }

    public async createTreatment(
        runID: number | null,
        userID: string,
        variant: string,
        durationMS: number,
        error: string,
    ) {
        /*
         * Publishes a treatment event to the server.
         *
         * experimentName: name of experiment associated with the call
         * userID: identifying of the user who originated this request
         * variant: string representation of the variant assignment
         * durationMS: duration in ms that value resolution took
         * error: exception raised during resolution if any
         */
        await this.axios.post('/treatment', {
            'run_id': runID,
            'user_id': userID,
            'variant': variant,
            'error': error,
            'duration_ms': durationMS,
        });
    }

    public async observe(
        userID: string,
        metric: string,
        value: number | boolean,
        createdTime: string | undefined=undefined,
    ) {
        /*
         * Publishes a metric measurement event for a given user.
         *
         * userID: identifier of the user who originated this request.
         * metric: name of the metric being observed
         * value: numeric representation of the value measured
         *
         */
        if (typeof(value) === 'boolean') {
            value = Number(value);
        }
        await this.axios.post('/measurement', {
            'user_id': userID,
            'metric_name': metric,
            'value': value,
            'created_time': createdTime,
        });
    }
}
