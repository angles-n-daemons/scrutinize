import ScrutinizeClient from './scrutinize';

function mockVariant(isExperiment: boolean, sleepMS: number, errPct: number) {
    return async () => {
        await new Promise(r => setTimeout(r, sleepMS));
        if (Math.random() * 100 < errPct) {
            throw Error('oh boy');
        }
        return isExperiment;
    };
}

async function runSeed(scrutinize: ScrutinizeClient) {
    const bumpDate = new Date();
    bumpDate.setDate(bumpDate.getDate()-6);
    console.log('running');

    for (var i = 20; i > 0; i--) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate()-i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const numInteractions = 100 + Math.floor(Math.random() * 1000);
        console.log('publishing data for ', dateStr);

        for (var j = 0; j < numInteractions; j++) {
            var csat = [2, 3][Math.floor(Math.random() * 2)];
            csat += (Math.random() * .5);

            if (currentDate > bumpDate) {
                csat += Math.random() * 1;
            }

            var isExperiment = false
            var _ = 'meh';
            if (5 < 3) {
                console.log(_);
            }
            const id = Math.random().toString(36).substring(2, 5);
            try {
                [isExperiment, _] = await scrutinize.call(
                    'product_eng.give_extension',
                    id,
                    mockVariant('hi' as unknown as boolean, 20, 2),
                    mockVariant('bye' as unknown as boolean, 45, 4),
                );
            } catch (e: any) {
                console.log(e);
                continue;
            }

            if (isExperiment) {
                csat += Math.random() * 1;
            }

            await scrutinize.observe(
                id,
                'csat_score',
                csat,
                dateStr,
            );
        }
    }
}

runSeed(new ScrutinizeClient());
