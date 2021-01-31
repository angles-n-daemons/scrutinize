import assert from 'assert';

import { AxiosInstance } from 'axios';

import ScrutinizeClient from './scrutinize';

class MockAxios{
    get() {
        return {};
    }
    post() {
        return {};
    }
}

const mockAxios = new MockAxios() as unknown as AxiosInstance;

async function testCall() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.axios = mockAxios;
    scrutinize.getExperiments = async () => {
        return {'testexp': {'run_id': 3, 'name': 'testexp', 'percentage': 50, 'active': true}}
    };

    const control = () => 5;
    const variant = () => 10;

    const tests = [
        ['lisaa', false, 5],
        ['garyoi', true, 10],
        ['eyjohn', false, 5],
        ['joan', true, 10],
    ];

    for (const [userID, expectedIsExperiment, expected] of tests) {
        const [isExperiment, result] = await scrutinize.call(
            'testexp',
            userID as string,
            control,
            variant,
        );
        assert(isExperiment === expectedIsExperiment);
        assert(result === expected);
    }
}

async function testCallCreateTreatment() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.axios = mockAxios;
    scrutinize.getExperiments = async () => {
        return {'testexp': {'run_id': 3, 'name': 'testexp', 'percentage': 50, 'active': true}}
    };

    const control = () => 5;
    const variant = () => 10;

    scrutinize.createTreatment = async (runID: any, userID: any, variant: any, _: any, _2: string) => {
        assert(runID === 3);
        assert(userID === 'mary');
        assert(variant === 'control');
    }

    await scrutinize.call(
        'testexp',
        'mary',
        control,
        variant,
    );
}

async function testCallException() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.getExperiments = async () => {
        return {'testexp': {'run_id': 3, 'name': 'testexp', 'percentage': 50, 'active': true}}
    };
    scrutinize.getVariant = async () => [false, 'control'];
    var errstring = '';
    scrutinize.createTreatment = async (_: any, _1: any, _2: any, _3: any, err: string) => {
        errstring = err;
    }

    const errorFunc = () => { throw Error('im an error') };

    try {
        await scrutinize.call(
            'testexp',
            'fake_person',
            errorFunc,
            2,
        );
    } catch(e: any) {}
    // verify errstring set from call failure
    assert(errstring == 'im an error');
}

async function testCallDuration() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.getExperiments = async () => {
        return {'testexp': {'run_id': 3, 'name': 'testexp', 'percentage': 50, 'active': true}}
    };
    scrutinize.getVariant = async () => [false, 'control'];

    var durationMSSeen = 0;
    scrutinize.createTreatment = async (_: any, _1: any, _2: any, durationMS: number, _4: any) => {
        durationMSSeen = durationMS;
    }

    var times = [5000, 10000];
    const getTime = () => { return times.shift() };

    try {
        await scrutinize.call(
            'testexp',
            'fake_person',
            1,
            2,
            getTime,
        );
    } catch(e: any) {}
    assert(durationMSSeen == 5000);
}

async function testResolveFunc() {
    const scrutinize = new ScrutinizeClient();
    assert(await scrutinize.resolve(() => 26) === 26);
}

async function testResolveAsync() {
    const scrutinize = new ScrutinizeClient();
    assert(await scrutinize.resolve(async () => 25) === 25);
}

async function testResolveLiteral() {
    const tests = [
            0,
            1,
            '1',
            'harry',
            false,
            BigInt(52),
            null,
    ];
    const scrutinize = new ScrutinizeClient();

    for (const expected of tests) {
        assert(await scrutinize.resolve(expected) === expected);
    }
}

async function testGetVariant() {
    const tests = [
        ['jane', true],
        ['tom', false],
        ['jim', false],
        ['mary', false],
        ['lonnie', true],
        ['alice', false],
        ['gerard', true],
        ['fiona', true],
        ['bernard', true],
        ['jimson', false],
        ['limson', false],
        ['fiona', true],
    ];
    const scrutinize = new ScrutinizeClient();
    scrutinize.getExperiments = async () => {
        return {'testexp': {'run_id': 3, 'name': 'testexp', 'percentage': 50, 'active': true}}
    };

    for (const [userID, expectedIsExperiment] of tests) {
        const results = await scrutinize.getVariant('testexp', userID as string);
        assert(results[0] === expectedIsExperiment);
    }
}

async function testGetVariantDiffersByExperiment() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.getExperiments = async () => {
        return {
            'testexp': {'run_id': 3,'name': 'testexp', 'percentage': 50, 'active': true},
            'otherexp': {'run_id': 3,'name': 'otherexp', 'percentage': 50, 'active': true},
        };
    };
    const userID = 'sally';
    assert(!(await scrutinize.getVariant('testexp', userID))[0]);
    assert((await scrutinize.getVariant('otherexp', userID))[0]);
}

async function testGetVariantActiveParam() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.getExperiments = async () => {
        return {
            'testexp': {'run_id': 3, 'name': 'testexp', 'percentage': 50, 'active': true},
            'otherexp': {'run_id': 3, 'name': 'otherexp', 'percentage': 50, 'active': false},
        };
    };
    const userID = 'sally';
    assert(!(await scrutinize.getVariant('testexp', userID))[0]);
    assert(!(await scrutinize.getVariant('otherexp', userID))[0]);
}

async function testGetVariantExperimentDoesntExist() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.getExperiments = async () => {
        return {
            'testexp': {'run_id': 3, 'name': 'testexp', 'percentage': 50, 'active': true},
        };
    };
    const userID = 'sally';
    assert(!(await scrutinize.getVariant('UNKNOWNEXPERIMENT', userID))[0]);
}

async function testGetExperimentsUseCached() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.experiments = {'blah': {
        run_id: 3,
        name: 'blah',
        percentage: 50,
        active: true,
    }};
    scrutinize.experimentsTTL = 1000000;
    scrutinize.experimentsPullTime = Date.now();
    scrutinize.axios = new MockAxios() as unknown as AxiosInstance;
    scrutinize.axios.get = async () => {
        return {data: [{'name': 'hi'}]} as any;
    };;

    const result = await scrutinize.getExperiments();
    // make sure pull didnt execute
    assert(Object.keys(result).length === 1);
    assert(Object.keys(scrutinize.experiments as Object).length === 1);
    assert(result['blah']);
}

async function testGetExperimentsPullOnNone() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.experimentsTTL = 1000000;
    scrutinize.experimentsPullTime = Date.now() / 1000;
    scrutinize.axios = new MockAxios() as unknown as AxiosInstance;
    scrutinize.axios.get = async () => {
        return {data: [{'name': 'hi'}]} as any;
    };

    const result = await scrutinize.getExperiments();
    // make sure pull didnt execute
    assert(Object.keys(result).length === 1);
    assert(Object.keys(scrutinize.experiments as Object).length === 1);
    assert(result['hi']);
}

async function testGetExperimentsTimeout() {
    const scrutinize = new ScrutinizeClient();
    scrutinize.experiments = {'blah': {
        run_id: 3,
        name: 'blah',
        percentage: 50,
        active: true,
    }};
    scrutinize.experimentsTTL = 10;
    scrutinize.experimentsPullTime = 0;
    scrutinize.axios = new MockAxios() as unknown as AxiosInstance;
    scrutinize.axios.get = async () => {
        return {data: [{'name': 'hi'}]} as any;
    };

    const result = await scrutinize.getExperiments();
    // make sure pull didnt execute
    assert(Object.keys(result).length === 2);
    assert(Object.keys(scrutinize.experiments as Object).length === 2);
    assert(result['blah']);
    assert(result['hi']);
}

async function testScrutinize() {
    testCall();
    testCallCreateTreatment();
    testCallException();
    testCallDuration();
    testResolveFunc();
    testResolveAsync();
    testResolveLiteral();
    testGetVariant();
    testGetVariantDiffersByExperiment();
    testGetVariantActiveParam();
    testGetVariantExperimentDoesntExist();
    testGetExperimentsUseCached();
    testGetExperimentsPullOnNone();
    testGetExperimentsTimeout();
}

testScrutinize();
